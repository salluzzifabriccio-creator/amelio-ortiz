(function () {
  "use strict";

  var BUCKET = "vehiculos";

  function getClient() {
    return window.__SUPABASE__ || null;
  }

  function getPublicUrl(storagePath) {
    var sb = getClient();
    if (!sb || !storagePath) return null;
    try {
      var res = sb.storage.from(BUCKET).getPublicUrl(storagePath);
      return (res && res.data && res.data.publicUrl) || null;
    } catch (e) {
      console.warn("[vehiculos-repo] getPublicUrl", e);
      return null;
    }
  }

  // Trae todos los vehículos con sus fotos (ordenadas), para catálogo público
  // y para el listado del admin. Devuelve una Promise<Array>.
  function listar(opts) {
    var sb = getClient();
    if (!sb) return Promise.resolve(null); // null = "sin Supabase", quien llama decide el fallback
    opts = opts || {};
    var query = sb
      .from("vehiculos")
      .select("*, vehiculo_fotos!vehiculo_fotos_vehiculo_id_fkey(id, storage_path, orden)")
      .order("created_at", { ascending: false });

    if (opts.estado) query = query.eq("estado", opts.estado);
    if (opts.tipo) query = query.eq("tipo", opts.tipo);

    return query.then(function (res) {
      if (res.error) throw res.error;
      return (res.data || []).map(normalizar);
    });
  }

  function obtener(id) {
    var sb = getClient();
    if (!sb) return Promise.resolve(null);
    return sb
      .from("vehiculos")
      .select("*, vehiculo_fotos!vehiculo_fotos_vehiculo_id_fkey(id, storage_path, orden)")
      .eq("id", id)
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return normalizar(res.data);
      });
  }

  // Agrega urls públicas + fotos ordenadas + foto de portada resuelta.
  function normalizar(row) {
    var fotos = (row.vehiculo_fotos || [])
      .slice()
      .sort(function (a, b) { return a.orden - b.orden; })
      .map(function (f) {
        return { id: f.id, storage_path: f.storage_path, orden: f.orden, url: getPublicUrl(f.storage_path) };
      });
    var portada = null;
    if (row.foto_portada_id) {
      portada = fotos.filter(function (f) { return f.id === row.foto_portada_id; })[0] || null;
    }
    if (!portada) portada = fotos[0] || null;
    row.fotos = fotos;
    row.fotoPortada = portada;
    row.fotoPortadaUrl = portada ? portada.url : null;
    return row;
  }

  function crear(datos) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    return sb.from("vehiculos").insert(datos).select().single().then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function actualizar(id, datos) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    return sb.from("vehiculos").update(datos).eq("id", id).select().single().then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  // Borra el vehículo, sus fotos del Storage y las filas de vehiculo_fotos
  // (estas últimas caen solas por ON DELETE CASCADE, pero el archivo en
  // Storage hay que borrarlo a mano).
  function eliminar(id) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    return sb
      .from("vehiculo_fotos")
      .select("storage_path")
      .eq("vehiculo_id", id)
      .then(function (res) {
        if (res.error) throw res.error;
        var paths = (res.data || []).map(function (f) { return f.storage_path; });
        var borrarStorage = paths.length ? sb.storage.from(BUCKET).remove(paths) : Promise.resolve();
        return Promise.resolve(borrarStorage);
      })
      .then(function () {
        return sb.from("vehiculos").delete().eq("id", id);
      })
      .then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
  }

  // Sube una foto nueva para un vehículo. `file` es un File del input.
  function subirFoto(vehiculoId, file, orden) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    var safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    var path = vehiculoId + "/" + Date.now() + "-" + safeName;
    return sb.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return sb
          .from("vehiculo_fotos")
          .insert({ vehiculo_id: vehiculoId, storage_path: path, orden: orden || 0 })
          .select()
          .single();
      })
      .then(function (res) {
        if (res.error) throw res.error;
        var foto = res.data;
        foto.url = getPublicUrl(foto.storage_path);
        return foto;
      });
  }

  function eliminarFoto(fotoId, storagePath) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    return sb.storage
      .from(BUCKET)
      .remove([storagePath])
      .then(function () {
        return sb.from("vehiculo_fotos").delete().eq("id", fotoId);
      })
      .then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
  }

  // orden: [{id, orden}, ...]
  function reordenarFotos(items) {
    var sb = getClient();
    if (!sb) return Promise.reject(new Error("Sin conexión a Supabase"));
    var updates = items.map(function (it) {
      return sb.from("vehiculo_fotos").update({ orden: it.orden }).eq("id", it.id);
    });
    return Promise.all(updates);
  }

  function marcarPortada(vehiculoId, fotoId) {
    return actualizar(vehiculoId, { foto_portada_id: fotoId });
  }

  window.VehiculosRepo = {
    listar: listar,
    obtener: obtener,
    crear: crear,
    actualizar: actualizar,
    eliminar: eliminar,
    subirFoto: subirFoto,
    eliminarFoto: eliminarFoto,
    reordenarFotos: reordenarFotos,
    marcarPortada: marcarPortada,
    getPublicUrl: getPublicUrl,
  };
})();

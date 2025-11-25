document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // Referencias a los elementos DOM
  // ==============================
  const tbody = document.querySelector("#tabla tbody");
  const inputProducto = document.getElementById("producto");
  const inputUnidades = document.getElementById("unidades");
  const inputCajas = document.getElementById("cajas");
  const inputTotalUnidades = document.getElementById("total_unidades");
  const btnRegistrar = document.getElementById("registrar");

  const btnExportar = document.getElementById("exportar");
  const btnEliminarTodo = document.getElementById("eliminarTodo");

  // =======================================
  // Lista de productos desde JSON externo
  // =======================================
  let productos = [];

  async function cargarProductos() {
    try {
      const response = await fetch("productos.json");
      if (!response.ok) throw new Error("No se pudo cargar productos.json");
      productos = await response.json();
      console.log("Productos cargados:", productos.length);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }

  cargarProductos();

  // =======================================
  // Funciones LocalStorage
  // =======================================
  function guardarEnLocalStorage() {
    const filas = Array.from(tbody.querySelectorAll("tr"));
    const registros = filas.map(fila => {
      const cols = fila.querySelectorAll("td");
      return {
        producto: cols[0].textContent,
        unidades: cols[1].textContent,
        cajas: cols[2].textContent,
        total: cols[3].textContent,
        fecha: cols[4].textContent
      };
    });
    localStorage.setItem("registrosInventario", JSON.stringify(registros));
  }

  function cargarDesdeLocalStorage() {
    const registros = JSON.parse(localStorage.getItem("registrosInventario")) || [];
    registros.forEach(r =>
      agregarRegistro(r.producto, r.unidades, r.cajas, r.total, r.fecha, false)
    );
  }

  // =======================================
  // Autocompletado de productos
  // =======================================
  function buscarProducto(texto) {
    const valor = texto.toUpperCase();
    return productos.filter(p => p.toUpperCase().includes(valor)).sort();
  }

  const listaSugerencias = document.createElement("div");
  listaSugerencias.classList.add("sugerencias");
  inputProducto.parentNode.appendChild(listaSugerencias);

  function mostrarSugerencias() {
    const valor = inputProducto.value.toUpperCase();
    listaSugerencias.innerHTML = "";
    if (!valor) return;

    const coincidencias = buscarProducto(inputProducto.value);
    coincidencias.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      div.classList.add("sugerencia");
      div.addEventListener("click", () => {
        inputProducto.value = item;
        listaSugerencias.innerHTML = "";
      });
      listaSugerencias.appendChild(div);
    });
  }

  inputProducto.addEventListener("input", mostrarSugerencias);
  document.addEventListener("click", (e) => {
    if (e.target !== inputProducto) listaSugerencias.innerHTML = "";
  });

  // =======================================
  // CÁLCULO AUTOMÁTICO TOTAL UNIDADES
  // =======================================
  function actualizarTotalUnidades() {
    const unidades = parseFloat(inputUnidades.value) || 0;
    const cajas = parseFloat(inputCajas.value) || 0;
    inputTotalUnidades.value = unidades * cajas;
  }

  inputUnidades.addEventListener("input", actualizarTotalUnidades);
  inputCajas.addEventListener("input", actualizarTotalUnidades);

  // =======================================
  // Añadir registro
  // =======================================
  function agregarRegistro(producto, unidades, cajas, total, fecha = null, guardar = true) {
    if (!producto) return;
    if (!fecha) fecha = new Date().toLocaleDateString();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="prod">${producto}</td>
      <td class="und">${unidades}</td>
      <td class="caj">${cajas}</td>
      <td class="tot">${total}</td>
      <td class="fec">${fecha}</td>
      <td>
        <button class="editar">Editar</button>
        <button class="eliminar">Eliminar</button>
      </td>
    `;

    // ELIMINAR
    tr.querySelector(".eliminar").addEventListener("click", () => {
      tr.remove();
      guardarEnLocalStorage();
    });

    // EDITAR
    tr.querySelector(".editar").addEventListener("click", (e) => {
      const btn = e.target;

      const prodTd = tr.querySelector(".prod");
      const undTd = tr.querySelector(".und");
      const cajTd = tr.querySelector(".caj");
      const totTd = tr.querySelector(".tot");

      if (btn.textContent === "Editar") {
        const p = prodTd.textContent;
        const u = undTd.textContent;
        const c = cajTd.textContent;

        prodTd.innerHTML = `<input type="text" value="${p}" class="edit-prod">`;
        undTd.innerHTML = `<input type="number" step="0.01" value="${u}" class="edit-und">`;
        cajTd.innerHTML = `<input type="number" step="1" value="${c}" class="edit-caj">`;
        totTd.innerHTML = `<input type="number" step="0.01" readonly class="edit-tot">`;

        const upd = () => {
          const newU = parseFloat(tr.querySelector(".edit-und").value) || 0;
          const newC = parseFloat(tr.querySelector(".edit-caj").value) || 0;
          tr.querySelector(".edit-tot").value = newU * newC;
        };

        tr.querySelector(".edit-und").addEventListener("input", upd);
        tr.querySelector(".edit-caj").addEventListener("input", upd);
        upd();

        btn.textContent = "Guardar";

      } else {
        const newProd = tr.querySelector(".edit-prod").value.trim();
        const newUnd = tr.querySelector(".edit-und").value.trim();
        const newCaj = tr.querySelector(".edit-caj").value.trim();
        const newTot = tr.querySelector(".edit-tot").value.trim();

        prodTd.textContent = newProd;
        undTd.textContent = newUnd;
        cajTd.textContent = newCaj;
        totTd.textContent = newTot;

        btn.textContent = "Editar";
        guardarEnLocalStorage();
      }
    });

    tbody.prepend(tr);
    if (guardar) guardarEnLocalStorage();
  }

  // =======================================
  // BOTÓN REGISTRAR corregido
  // =======================================
  btnRegistrar.addEventListener("click", () => {
    const producto = inputProducto.value.trim();
    const unidades = parseFloat(inputUnidades.value) || 0;
    const cajas = parseFloat(inputCajas.value) || 0;
    const total = parseFloat(inputTotalUnidades.value) || 0;

    if (!producto) return alert("Debes escribir un producto.");
    if (total <= 0) return alert("Total unidades debe ser mayor que 0.");

    agregarRegistro(producto, unidades, cajas, total);

    inputProducto.value = "";
    inputUnidades.value = "";
    inputCajas.value = "";
    inputTotalUnidades.value = "";
    listaSugerencias.innerHTML = "";
  });

  // =======================================
  // Exportar CSV
  // =======================================
  btnExportar.addEventListener("click", () => {
    const filas = Array.from(tbody.querySelectorAll("tr"));
    if (filas.length === 0) return alert("No hay registros para exportar.");

    let csvContent = "Producto;Unidades;Cajas;Total;Fecha\n";

    filas.forEach(fila => {
      const cols = fila.querySelectorAll("td");
      const filaDatos = Array.from(cols)
        .slice(0, 5)
        .map(td => td.textContent.replace(/;/g, ","))
        .join(";");
      csvContent += filaDatos + "\n";
    });

    const fechaArchivo = new Date().toLocaleDateString().replace(/\//g, "-");
    const nombreArchivo = `inventario_${fechaArchivo}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
  });

  // =======================================
  // Eliminar todo
  // =======================================
  btnEliminarTodo.addEventListener("click", () => {
    const confirmacion = prompt("Escribe ELIMINAR TODO para borrar todos los registros:");
    if (confirmacion === "ELIMINAR TODO") {
      tbody.innerHTML = "";
      guardarEnLocalStorage();
    }
  });

  // =======================================
  // Cargar registros al iniciar
  // =======================================
  cargarDesdeLocalStorage();
});

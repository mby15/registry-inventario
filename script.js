// ==============================
// Referencias a los elementos DOM
// ==============================
const tbody = document.querySelector("#tabla tbody");
const inputProducto = document.getElementById("producto");
const inputCantidad = document.getElementById("cantidad");
const btnRegistrar = document.getElementById("registrar");

const inputProductoNuevo = document.getElementById("productoNuevo");
const inputCantidadNuevo = document.getElementById("cantidadNuevo");
const btnRegistrarNuevo = document.getElementById("registrarNuevo");

const btnExportar = document.getElementById("exportar");
const btnEliminarTodo = document.getElementById("eliminarTodo");

// =======================================
// Lista predeterminada de productos
// =======================================
const productos = [
  "AGUA BRICK 0,33L",
  "AGUA FUENTEPRIMAVERA GAS 0,50cl PET",
  "AGUA LANJARON 0,50cl RET",
  "AGUA LANJARON 1L RET",
  "AGUA LANJARON GAS 0,50cl RET",
  "AGUA LANJARÓN PET 0.33L",
  "1/3 CRUZCAMPO ESPECIAL RT 24 UDS",
  "1/3 CRUZCAMPO GRAN RESERVA NR 24 UDS",
  "1/3 NR CRUZCAMPO SIN GLUTEN 12 UDS",
  "18/17 LA RUBIA 1/3 12 UDS",
  "AGUILA SIN FILTRAR NR 12 UDS",
  "AMSTEL ORO 0´0 1/3 RET",
  "AMSTEL ORO 1/3 RET 24 UDS",
  "AMSTEL RADLER 1/3 RET 24 UDS",
  "AMSTEL RADLER 30L BARRIL",
  "BIRRA MORETTI 1/3 24 UDS",
  "DESPERADOS1/3 NR 24 UDS",
  "EL AGUILA 1900 1/3 RET 24 UDS",
  "EL ALCAZAR 1/3 12 UDS",
  "GUINNESS HOP HOUSE 13 1/3 12 UDS"
];

// =======================================
// LocalStorage: Guardar y Cargar
// =======================================
function guardarEnLocalStorage() {
  const filas = Array.from(tbody.querySelectorAll("tr"));
  const registros = filas.map(fila => {
    const cols = fila.querySelectorAll("td");
    return {
      producto: cols[0].textContent,
      cantidad: cols[1].textContent,
      fecha: cols[2].textContent
    };
  });
  localStorage.setItem("registrosInventario", JSON.stringify(registros));
}

function cargarDesdeLocalStorage() {
  const registros = JSON.parse(localStorage.getItem("registrosInventario")) || [];
  registros.forEach(r => agregarRegistro(r.producto, r.cantidad, r.fecha, false));
}

// =======================================
// Autocompletado de productos
// =======================================
function buscarProducto(texto) {
  const valor = texto.toUpperCase();
  return productos
    .filter(p => p.toUpperCase().includes(valor))
    .sort();
}

// Contenedor de sugerencias
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

// Cerrar lista si clic fuera
document.addEventListener("click", (e) => {
  if (e.target !== inputProducto) {
    listaSugerencias.innerHTML = "";
  }
});

// =======================================
// Función para añadir registro
// =======================================
function agregarRegistro(producto, cantidad, fecha = null, guardar = true) {
  if (!producto || !cantidad) return;

  if (!fecha) {
    fecha = new Date().toLocaleDateString();
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${producto}</td>
    <td>${cantidad}</td>
    <td>${fecha}</td>
    <td><button class="eliminar">Eliminar</button></td>
  `;

  tr.querySelector(".eliminar").addEventListener("click", () => {
    tr.remove();
    guardarEnLocalStorage();
  });

  tbody.prepend(tr);

  if (guardar) guardarEnLocalStorage();
}

// =======================================
// Botones Registrar
// =======================================
btnRegistrar.addEventListener("click", () => {
  const producto = inputProducto.value.trim();
  const cantidad = inputCantidad.value.trim();
  agregarRegistro(producto, cantidad);
  inputProducto.value = "";
  inputCantidad.value = "";
  listaSugerencias.innerHTML = "";
});

btnRegistrarNuevo.addEventListener("click", () => {
  const producto = inputProductoNuevo.value.trim();
  const cantidad = inputCantidadNuevo.value.trim();
  agregarRegistro(producto, cantidad);
  inputProductoNuevo.value = "";
  inputCantidadNuevo.value = "";
});

// =======================================
// Exportar CSV
// =======================================
btnExportar.addEventListener("click", () => {
  const filas = Array.from(tbody.querySelectorAll("tr"));
  if (filas.length === 0) return alert("No hay registros para exportar.");

  let csvContent = "Producto;Cantidad;Fecha\n";
  filas.forEach(fila => {
    const cols = fila.querySelectorAll("td");
    const filaDatos = Array.from(cols)
      .slice(0, 3)
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
// Eliminar todo con confirmación
// =======================================
btnEliminarTodo.addEventListener("click", () => {
  const confirmacion = prompt("Escribe ELIMINAR TODO para borrar todos los registros:");
  if (confirmacion === "ELIMINAR TODO") {
    tbody.innerHTML = "";
    guardarEnLocalStorage();
  } else {
    alert("No se eliminó ningún registro.");
  }
});

// =======================================
// Cargar registros al iniciar
// =======================================
document.addEventListener("DOMContentLoaded", cargarDesdeLocalStorage);

// Lista predeterminada de productos
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

// Referencias a los campos
const inputProducto = document.getElementById("producto");
const inputCantidad = document.getElementById("cantidad");
const btnRegistrar = document.getElementById("registrar");
const tbody = document.querySelector("#tabla tbody");

// Función para filtrar coincidencias en orden alfabético, insensible a mayúsculas
function buscarProducto(texto) {
  const valor = texto.toUpperCase();
  return productos
    .filter(p => p.toUpperCase().includes(valor))
    .sort();
}

// Evento input para autocompletado
inputProducto.addEventListener("input", () => {
  const coincidencias = buscarProducto(inputProducto.value);
  console.log("Coincidencias:", coincidencias); // Por ahora, mostramos en consola
});


// Crear contenedor de sugerencias
const listaSugerencias = document.createElement("div");
listaSugerencias.classList.add("sugerencias");
inputProducto.parentNode.appendChild(listaSugerencias);

// Función para mostrar sugerencias
function mostrarSugerencias() {
  const valor = inputProducto.value.toUpperCase();
  listaSugerencias.innerHTML = ""; // Limpiar lista

  if (!valor) return; // Si está vacío, no mostramos nada

  const coincidencias = productos
    .filter(p => p.toUpperCase().includes(valor))
    .sort();

  coincidencias.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    div.classList.add("sugerencia");
    div.addEventListener("click", () => {
      inputProducto.value = item; // Al hacer clic, se pone en el input
      listaSugerencias.innerHTML = ""; // Limpiar lista
    });
    listaSugerencias.appendChild(div);
  });
}

// Evento input para autocompletado
inputProducto.addEventListener("input", mostrarSugerencias);

// Cerrar lista si se hace clic fuera
document.addEventListener("click", (e) => {
  if (e.target !== inputProducto) {
    listaSugerencias.innerHTML = "";
  }
});

// Función para añadir un registro a la tabla
function agregarRegistro(producto, cantidad) {
  if (!producto || !cantidad) return; // No hacer nada si faltan datos

  const fecha = new Date().toLocaleDateString(); // Fecha del registro
  const tr = document.createElement("tr");

  // Columnas
  tr.innerHTML = `
    <td>${producto}</td>
    <td>${cantidad}</td>
    <td>${fecha}</td>
    <td><button class="eliminar">Eliminar</button></td>
  `;

  // Botón eliminar individual
  tr.querySelector(".eliminar").addEventListener("click", () => {
    tr.remove();
  });

  // Añadir al inicio del tbody
  tbody.prepend(tr);
}

// Evento botón Registrar principal
btnRegistrar.addEventListener("click", () => {
  const producto = inputProducto.value.trim();
  const cantidad = inputCantidad.value.trim();

  agregarRegistro(producto, cantidad);

  // Vaciar campos
  inputProducto.value = "";
  inputCantidad.value = "";
  listaSugerencias.innerHTML = "";
});

// Evento botón Registrar adicional
const btnRegistrarNuevo = document.getElementById("registrarNuevo");
const inputProductoNuevo = document.getElementById("productoNuevo");
const inputCantidadNuevo = document.getElementById("cantidadNuevo");

btnRegistrarNuevo.addEventListener("click", () => {
  const producto = inputProductoNuevo.value.trim();
  const cantidad = inputCantidadNuevo.value.trim();

  agregarRegistro(producto, cantidad);

  inputProductoNuevo.value = "";
  inputCantidadNuevo.value = "";
});

// Botón Exportar CSV
const btnExportar = document.getElementById("exportar");
btnExportar.addEventListener("click", () => {
  const filas = Array.from(tbody.querySelectorAll("tr"));
  if (filas.length === 0) return alert("No hay registros para exportar.");

  let csvContent = "Producto;Cantidad;Fecha\n";

  filas.forEach(fila => {
    const cols = fila.querySelectorAll("td");
    const filaDatos = Array.from(cols)
      .slice(0, 3) // Producto, Cantidad, Fecha
      .map(td => td.textContent.replace(/;/g, ",")) // evitar ; en datos
      .join(";");
    csvContent += filaDatos + "\n";
  });

  const fecha = new Date().toLocaleDateString().replace(/\//g, "-");
  const nombreArchivo = `inventario_${fecha}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.click();
});

// Botón Eliminar todo con confirmación
const btnEliminarTodo = document.getElementById("eliminarTodo");
btnEliminarTodo.addEventListener("click", () => {
  const confirmacion = prompt("Escribe ELIMINAR TODO para borrar todos los registros:");
  if (confirmacion === "ELIMINAR TODO") {
    tbody.innerHTML = "";
  } else {
    alert("No se eliminó ningún registro.");
  }
});

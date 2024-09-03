// Section: Fetching and Handling Data

let crearBorrarChart = null;

async function fetchValores() {
  const response = await fetch("https://mindicador.cl/api/");

  if (response.ok) {
    const info = await response.json();

    const valorDolar = info.dolar.valor;
    const valorEuro = info.euro.valor;

    document.querySelector('option[value="usd"]').dataset.value = valorDolar;
    document.querySelector('option[value="eur"]').dataset.value = valorEuro;
  } else {
    console.error("Error.", response.status);
  }
}

async function fetchInfoMoneda(tipoMoneda) {
  const url =
    tipoMoneda === "usd"
      ? "https://www.mindicador.cl/api/dolar"
      : "https://www.mindicador.cl/api/euro";

  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();

    const valores = data.serie.slice(0, 10).reverse();
    const labels = valores.map((entry) => entry.fecha.substring(0, 10));
    const precios = valores.map((entry) => entry.valor);

    return { labels, precios };
  } else {
    console.error("Error recibiendo info de monedas.", response.status);
    return null; // Return null to indicate an error
  }
}

async function handleCurrencyChange() {
  const valorMoneda = document.getElementById("tiposMoneda").value;

  if (valorMoneda !== "none") {
    const infoMoneda = await fetchInfoMoneda(valorMoneda);
    if (infoMoneda) {
      renderChart(infoMoneda.labels, infoMoneda.precios, valorMoneda);
    }
  }
}

async function transformarDinero() {
  const cantidad = document.getElementById("pesosChilenos").value;
  const valorMoneda = document.getElementById("tiposMoneda").value;
  const resultElement = document.querySelector(".valorResultado");

  if (cantidad === "") {
    alert("Por favor escribe un monto.");
    return;
  }

  if (valorMoneda === "none") {
    alert("Por favor selecciona un tipo de moneda.");
    return;
  }

  const cantidadNum = Number(cantidad);
  const valorMonedaNum = Number(
    document.querySelector(`option[value="${valorMoneda}"]`).dataset.value
  );

  if (isNaN(valorMonedaNum) || valorMonedaNum === 0) {
    resultElement.innerHTML = "Error: Valor de moneda no disponible.";
    return;
  }

  const resultadoFinal = cantidadNum / valorMonedaNum;
  resultElement.innerHTML = resultadoFinal.toFixed(2);
}

document
  .getElementById("tiposMoneda")
  .addEventListener("change", handleCurrencyChange);
document.querySelector("button").addEventListener("click", transformarDinero);

fetchValores().then(() => {
  handleCurrencyChange();
});

function renderChart(labels, data, tipoMoneda) {
  const contexto = document.getElementById("chartMonedas").getContext("2d");

  if (crearBorrarChart) {
    crearBorrarChart.destroy();
  }

  const title = tipoMoneda === "usd" ? "Valor Dólar" : "Valor Euro";
  const label =
    tipoMoneda === "usd"
      ? "Valor Dólar de los últimos 10 días"
      : "Valor Euro de los últimos 10 días";

  crearBorrarChart = new Chart(contexto, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 50,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

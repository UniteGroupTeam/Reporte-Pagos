// CONFIGURACIÓN BACKEND (Code.gs)
const API_URL = "https://script.google.com/macros/s/AKfycby5auzXYu4yPPIc4DEfTwsR42SPaEKRXm9fCi3-eeW0GNOat-Q9YQIkazhc3FFAVM_B/exec";

// NOMBRES DE MESES (Visualización)
const MONTHS = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
];

// Opciones del selector de pagos (Índices y nombres para el backend)
const MONTH_OPTIONS = [
    { name: "Enero", colIndex: 5 },
    { name: "Febrero", colIndex: 6 },
    { name: "Marzo", colIndex: 7 },
    { name: "Abril", colIndex: 8 },
    { name: "Mayo", colIndex: 9 },
    { name: "Junio", colIndex: 10 },
    { name: "Julio", colIndex: 11 },
    { name: "Agosto", colIndex: 12 },
    { name: "Septiembre", colIndex: 13 },
    { name: "Octubre", colIndex: 14 },
    { name: "Noviembre", colIndex: 15 },
    { name: "Diciembre", colIndex: 16 }
];

const APP = {
    data: [],
    totalExpenses: 0,
    currentNeighborRowIndex: null,

    init: async () => {
        // Event Listeners
        document.getElementById('search-input').addEventListener('input', APP.handleSearch);
        document.getElementById('btn-withdraw').addEventListener('click', () => APP.openModal('withdraw'));
        document.getElementById('btn-reset').addEventListener('click', APP.handleReset);

        // Form submissions
        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            APP.handlePaymentSubmit();
        });

        document.getElementById('withdraw-form').addEventListener('submit', (e) => {
            e.preventDefault();
            APP.handleWithdrawSubmit();
        });

        APP.renderMonthOptions();

        // Cargar Datos
        await APP.fetchData();
    },

    fetchData: async () => {
        APP.setLoading(true, "Cargando datos...");
        try {
            const response = await fetch(API_URL);
            const json = await response.json();

            APP.data = json.neighbors || [];
            APP.totalExpenses = parseFloat(json.totalExpenses) || 0;

            APP.renderList(APP.data);
            APP.updateDashboard();

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("⚠️ Error de conexión. Revisa tu internet.");
        } finally {
            APP.setLoading(false);
        }
    },

    renderList: (rows) => {
        const container = document.getElementById('neighbors-list');
        container.innerHTML = '';

        if (!rows || rows.length <= 1) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No hay vecinos registrados.</div>';
            return;
        }

        const mappedRows = rows.map((row, index) => ({ originalIndex: index + 1, data: row })).slice(1);
        APP.renderCards(mappedRows); // Initial render
    },

    renderCards: (neighborsList) => {
        const container = document.getElementById('neighbors-list');
        container.innerHTML = '';

        if (neighborsList.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5"><h4>No se encontraron resultados 🔍</h4></div>';
            return;
        }

        neighborsList.forEach(item => {
            const row = item.data;
            const realRow = item.originalIndex;

            const calle = row[1] || '';
            const num = row[2] || '';
            const nombre = row[3] || 'Vecino Sin Nombre';
            const mesesValues = row.slice(4, 16);

            let gridHTML = `<div class="month-grid">`;
            mesesValues.forEach((val, i) => {
                const monthName = MONTHS[i];
                const isPaid = (typeof val === 'number' && val > 0) || (typeof val === 'string' && val.trim() !== '');
                const amountText = isPaid ? `$${val}` : '';
                const stateClass = isPaid ? 'paid' : '';

                gridHTML += `
                    <div class="month-tag ${stateClass}">
                        <span>${monthName}</span>
                        <span class="amount">${amountText}</span>
                    </div>
                `;
            });
            gridHTML += `</div>`;

            const col = document.createElement('div');
            col.className = 'col-sm-6 col-lg-4 col-xl-3';
            col.innerHTML = `
                <div class="card neighbor-card p-3 h-100" onclick="APP.openPaymentModal(${realRow}, '${nombre}', '${calle} #${num}')">
                    <h5 class="card-title text-truncate">${nombre}</h5>
                    <div class="card-subtitle text-truncate">📍 ${calle} #${num}</div>
                    ${gridHTML}
                </div>
            `;
            container.appendChild(col);
        });
    },

    updateDashboard: () => {
        let totalIncome = 0;
        APP.data.slice(1).forEach(row => {
            for (let i = 4; i < 16; i++) {
                const val = parseFloat(row[i]);
                if (!isNaN(val)) totalIncome += val;
            }
        });

        const balance = totalIncome - APP.totalExpenses;

        document.getElementById('total-income').innerText = `$${totalIncome.toLocaleString('es-MX')}`;
        document.getElementById('total-expenses').innerText = `$${APP.totalExpenses.toLocaleString('es-MX')}`;

        const balEl = document.getElementById('total-balance');
        balEl.innerText = `$${balance.toLocaleString('es-MX')}`;
        balEl.className = balance >= 0 ? 'display-3 fw-bold text-success' : 'display-3 fw-bold text-danger';
    },

    handleSearch: (e) => {
        const term = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const allNeighbors = APP.data.map((row, index) => ({ originalIndex: index + 1, data: row })).slice(1);

        if (!term) {
            APP.renderCards(allNeighbors);
            return;
        }

        const filtered = allNeighbors.filter(item => {
            const row = item.data;
            const fullString = `${row[1]} ${row[2]} ${row[3]}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return fullString.includes(term);
        });

        APP.renderCards(filtered);
    },

    renderMonthOptions: () => {
        const select = document.getElementById('month-select');
        select.innerHTML = '';
        MONTH_OPTIONS.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.colIndex;
            option.text = opt.name;
            select.appendChild(option);
        });

        const currentMonthIndex = new Date().getMonth();
        if (currentMonthIndex < MONTH_OPTIONS.length) {
            select.selectedIndex = currentMonthIndex;
        }
    },

    openPaymentModal: (rowIndex, name, address) => {
        APP.currentNeighborRowIndex = rowIndex;
        document.getElementById('modalNeighborName').innerText = name;
        document.getElementById('modalNeighborAddress').innerText = address;
        document.getElementById('payment-amount').value = '';

        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    },

    openModal: (type) => {
        if (type === 'withdraw') {
            document.getElementById('withdraw-concept').value = '';
            document.getElementById('withdraw-amount').value = '';
            const modal = new bootstrap.Modal(document.getElementById('withdrawModal'));
            modal.show();
        }
    },

    handlePaymentSubmit: async () => {
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const colIndex = parseInt(document.getElementById('month-select').value);

        if (!amount || amount <= 0) { alert("Ingresa un monto válido"); return; }

        // Close modal manually first
        const el = document.getElementById('paymentModal');
        const modal = bootstrap.Modal.getInstance(el);
        modal.hide();

        await APP.sendPost({
            action: "PAYMENT",
            rowIndex: APP.currentNeighborRowIndex,
            colIndex: colIndex,
            value: amount
        }, "Pago guardado exitosamente");
    },

    handleWithdrawSubmit: async () => {
        const concept = document.getElementById('withdraw-concept').value;
        const amount = parseFloat(document.getElementById('withdraw-amount').value);

        if (!amount || amount <= 0 || !concept) { alert("Completa los datos"); return; }

        // Close modal manually first
        const el = document.getElementById('withdrawModal');
        const modal = bootstrap.Modal.getInstance(el);
        modal.hide();

        await APP.sendPost({
            action: "WITHDRAW",
            concept: concept,
            amount: amount
        }, "Retiro registrado. El balance se actualizará pronto.");
    },

    handleReset: async () => {
        const confirmation = prompt("⚠️ PELIGRO:\nEsto borrará TODOS los pagos registrados.\n\nPara confirmar, escribe: BORRAR");
        if (confirmation === "BORRAR") {
            await APP.sendPost({ action: "RESET" }, "Base de datos reiniciada.");
        } else if (confirmation !== null) {
            alert("Acción cancelada. La palabra clave no coincidió.");
        }
    },

    // Generic POST Helper
    sendPost: async (payload, successMsg) => {
        let msg = "Guardando...";
        if (payload.action === "WITHDRAW") msg = "Registrando retiro...";
        if (payload.action === "RESET") msg = "Borrando base de datos...";

        APP.setLoading(true, msg);

        try {
            await fetch(API_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            setTimeout(async () => {
                APP.setLoading(false);
                alert(successMsg);
                await APP.fetchData();
            }, 1500);

        } catch (error) {
            console.error("Error posting:", error);
            APP.setLoading(false);
            alert("Error enviando datos. Intenta de nuevo.");
        }
    },

    setLoading: (isLoading, message = "Cargando datos...") => {
        const overlay = document.getElementById('loading-overlay');
        const msgEl = document.getElementById('loading-message');
        const list = document.getElementById('neighbors-list');

        if (isLoading) {
            if (msgEl) msgEl.innerText = message;
            if (overlay) {
                overlay.classList.remove('d-none');
                document.body.classList.add('loading-active');
            }
            if (list) list.style.opacity = '0.3';
        } else {
            if (list) list.style.opacity = '1';

            if (overlay) {
                overlay.style.opacity = '0'; // Fade out visual
                setTimeout(() => {
                    overlay.classList.add('d-none');
                    overlay.style.opacity = '1'; // Reset
                    document.body.classList.remove('loading-active');
                }, 300);
            }

            // Re-render check
            if (APP.data.length > 0) {
                const currentSearch = document.getElementById('search-input');
                if (currentSearch && currentSearch.value) {
                    const event = new Event('input');
                    currentSearch.dispatchEvent(event);
                } else {
                    const all = APP.data.map((row, i) => ({ originalIndex: i + 1, data: row })).slice(1);
                    APP.renderCards(all);
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', APP.init);

const apiUrl = "http://localhost:5000/tarefas/";
const dataGrid = document.getElementById("dataGrid");
const modalForm = document.getElementById("modal-form");
const modalNotification = document.getElementById("modal-notification");
const modalTitleNotification = document.getElementById(
   "modalTitleNotification"
);
const modalTitleForm = document.getElementById("modalTitle");
const openModal = document.getElementById("openModal");
const closeModalForm = document.getElementById("closeModal");
const closeModalNotification = document.getElementById(
   "closeModalNotification"
);
const saveItem = document.getElementById("saveItem");
const taskTitle = document.getElementById("taskTitle");
const taskCreator = document.getElementById("taskCreator");
const taskDescription = document.getElementById("taskDescription");
const taskExecutor = document.getElementById("taskExecutor");
const loadingContainer = document.getElementById("loading-container");
let editingItemId = null;

const fetchItems = async () => {
   handleLoading(true);
   try {
      const response = await fetch(apiUrl);
      const items = await response.json();
      renderGrid(items);
   } catch (error) {
      handleRequestError(error);
   } finally {
      handleLoading(false);
   }
};

const renderGrid = (items) => {
   dataGrid.innerHTML = "";
   if (items.length === 0) {
      dataGrid.innerHTML =
         "<div class='grid-item'>Nenhuma tarefa cadastrada.</div>";
      return;
   }
   items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("grid-item");
      itemElement.innerHTML = `
               <span>📖 Título: ${renderLongWork(
                  item.titulo
               )} -   Executor: ${renderLongWork(item.executor)} </span>
               <div>
                  <button class="edit" onclick="editItem('${item.id}', '${
         item.titulo
      }', '${item.criador}', '${item.executor}', '${
         item.descricao
      }')">✏️</button>
                  <button class="delete" onclick="deleteItem('${
                     item.id
                  }')">🗑️</button>
               </div>
            `;
      dataGrid.appendChild(itemElement);
   });
};

const renderLongWork = (text) => {
   const maxLength = 10;
   if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
   }
   return text;
};

const editItem = (id, titulo, criador, executor, descricao) => {
   editingItemId = id;
   taskTitle.value = titulo;
   taskCreator.value = criador;
   taskExecutor.value = executor;
   taskDescription.value = descricao;
   taskCreator.disabled = true;
   modalTitleForm.textContent = "Editar Tarefa";
   modalForm.style.display = "flex";
};

const deleteItem = async (id) => {
   handleLoading(true);
   await fetch(`${apiUrl}${id}`, { method: "DELETE" })
      .then((response) => {
         if (response.status !== 200) return handleRequestError(response);
         fetchItems();
      })
      .catch((error) => handleRequestError(error))
      .finally(() => handleLoading(false));
};

const saveOrEditItem = async () => {
   const titulo = taskTitle.value.trim();
   const criador = taskCreator.value.trim();
   const descricao = taskDescription.value.trim();
   const executor = taskExecutor.value.trim();

   if (!titulo || !criador || !descricao || !executor) return;
   const method = editingItemId ? "PUT" : "POST";
   const url = editingItemId ? `${apiUrl}${editingItemId}` : apiUrl;

   handleLoading(true);
   await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         titulo,
         criador,
         descricao,
         executor,
      }),
   })
      .then((response) => {
         if (response.status !== 200) return handleRequestError(response);
         modalForm.style.display = "none";
         fetchItems();
      })
      .catch((error) => handleRequestError(error))
      .finally(() => handleLoading(false));
};

const handleRequestError = (error) => {
   modalTitleNotification.textContent = `Ops! Ocorreu um erro ao salvar a tarefa. - ${error.status}`;
   modalNotification.style.display = "flex";
};

const handleLoading = (isLoading) => {
   loadingContainer.style.display = isLoading ? "flex" : "none";
};

saveItem.addEventListener("click", async () => {
   saveOrEditItem();
});

openModal.addEventListener("click", () => {
   editingItemId = null;
   taskTitle.value = "";
   taskCreator.value = "";
   taskDescription.value = "";
   taskExecutor.value = "";
   modalTitleForm.textContent = "Adicionar Tarefa";
   modalForm.style.display = "flex";
});

closeModalNotification.addEventListener("click", () => {
   modalNotification.style.display = "none";
});

closeModal.addEventListener("click", () => {
   modalForm.style.display = "none";
});

window.addEventListener("click", (e) => {
   if (e.target === modalForm) modalForm.style.display = "none";
   if (e.target === modalNotification) modalNotification.style.display = "none";
});

fetchItems();

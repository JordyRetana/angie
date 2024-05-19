
// Selectors for new category form
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

// Selector for categories container
const categoriesContainer = document.querySelector('[data-categories]');

// Selector for currently viewing
const currentlyViewing = document.querySelector('[data-currently-viewing]');

// Selector for new todo form
const newTodoForm = document.querySelector('[data-new-todo-form]');
const newTodoSelect = document.querySelector('[data-new-todo-select]');
const newTodoInput = document.querySelector('[data-new-todo-input]');

// Selector for edit todo form
const editTodoForm = document.querySelector('[data-edit-todo-form]');
const editTodoSelect = document.querySelector('[data-edit-todo-select]');
const editTodoInput = document.querySelector('[data-edit-todo-input]');

// Selector for todos container
const todosContainer = document.querySelector('[data-cards]');

// Local storage keys
const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_TODOS_KEY = 'LOCAL_STORAGE_TODOS_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

// Set selectedCategoryId to null on load to ensure "View All" is active
let selectedCategoryId = null;
localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TODOS_KEY)) || [];
const newTodoDate = document.querySelector('[data-new-todo-date]').value;

// EVENT: Add Category
newCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = newCategoryInput.value;
    const isCategoryEmpty = !category || !category.trim().length;

    if (isCategoryEmpty) {
        return console.log('please enter a task');
    }

    categories.push({ _id: Date.now().toString(), category: category, color: getRandomHexColor() });

    newCategoryInput.value = '';

    saveAndRender();
});

// EVENT: Get Selected Category Id
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
        if (!e.target.dataset.categoryId) {
            selectedCategoryId = null;
        } else {
            selectedCategoryId = e.target.dataset.categoryId;
        }

        saveAndRender();
    }
});

// EVENT: Get Selected Category Color
categoriesContainer.addEventListener('change', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const newCategoryColor = e.target.value;
        const categoryId = e.target.parentElement.dataset.categoryId;
        const categoryToEdit = categories.find((category) => category._id === categoryId);

        categoryToEdit.color = newCategoryColor;

        saveAndRender();
    }
});

// EVENT: Delete Selected Category
currentlyViewing.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'span') {
        categories = categories.filter((category) => category._id !== selectedCategoryId);

        todos = todos.filter((todo) => todo.categoryId !== selectedCategoryId);

        selectedCategoryId = null;

        saveAndRender();
    }
});

newTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTodoDate = document.querySelector('[data-new-todo-date]').value;
    if (!newTodoDate) {
        return console.log('Please enter a date');
    }
    todos.push({
        _id: Date.now().toString(),
        categoryId: newTodoSelect.value,
        todo: newTodoInput.value,
        date: newTodoDate, // Almacenar la fecha junto con la tarea
    });

    newTodoSelect.value = '';
    newTodoInput.value = '';
    document.querySelector('[data-new-todo-date]').value = ''; // Resetear el campo de fecha

    saveAndRender();
});

// EVENT: Load Edit Todo Form With Values
let todoToEdit = null;
todosContainer.addEventListener('click', (e) => {
    if (e.target.classList[1] === 'fa-edit') {
        newTodoForm.style.display = 'none';
        editTodoForm.style.display = 'flex';

        todoToEdit = todos.find((todo) => todo._id === e.target.dataset.editTodo);

        editTodoSelect.value = todoToEdit.categoryId;
        editTodoInput.value = todoToEdit.todo;
        document.querySelector('[data-edit-todo-date]').value = todoToEdit.date; // Cargar la fecha actual
    }
    if (e.target.classList[1] === 'fa-trash-alt') {
        const todoToDeleteIndex = todos.findIndex((todo) => todo._id === e.target.dataset.deleteTodo);

        todos.splice(todoToDeleteIndex, 1);

        saveAndRender();
    }
});


// EVENT: Update The Todo Being Edited With New Values
editTodoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    todoToEdit.categoryId = editTodoSelect.value;
    todoToEdit.todo = editTodoInput.value;
    todoToEdit.date = document.querySelector('[data-edit-todo-date]').value; // Actualizar la fecha

    editTodoForm.style.display = 'none';
    newTodoForm.style.display = 'flex';

    editTodoSelect.value = '';
    editTodoInput.value = '';
    document.querySelector('[data-edit-todo-date]').value = ''; // Resetear el campo de fecha

    saveAndRender();
});


// *==================== Functions ====================

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
}

function render() {
    clearChildElements(categoriesContainer);
    clearChildElements(newTodoSelect);
    clearChildElements(editTodoSelect);
    clearChildElements(todosContainer);

    renderCategories();
    renderFormOptions();
    renderTodos();

    // Set the current viewing category
    if (!selectedCategoryId || selectedCategoryId === 'null') {
        currentlyViewing.innerHTML = `Estas Viendo <strong>Todas Las Categorias </strong>`;
    } else {
        const currentCategory = categories.find((category) => category._id === selectedCategoryId);
        currentlyViewing.innerHTML = `Estas Viendo <strong>${currentCategory.category}</strong> <span>(delete)</span>`;
    }
}



function renderFormOptions() {

    newTodoSelect.innerHTML +=  `<option value=" ">Categoria</option>`;
    editTodoSelect.innerHTML += `<option value=" ">Categoria</option>`;

    categories.forEach(({ _id, category }) => {
        newTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
        editTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
    });
}

function renderCategories() {
    clearChildElements(categoriesContainer);

    categoriesContainer.innerHTML = `<li class="sidebar-item ${!selectedCategoryId ? 'active' : ''}" data-category-id="">View All</li>`;

    categories.forEach(({ _id, category, color }) => {
        categoriesContainer.innerHTML += `<li class="sidebar-item ${_id === selectedCategoryId ? 'active' : ''}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
    });
}

function renderTodos() {
    clearChildElements(todosContainer);

    const filteredTodos = selectedCategoryId ? todos.filter(todo => todo.categoryId === selectedCategoryId) : todos;

    filteredTodos.forEach(({ _id, categoryId, todo, date }) => {
        const categoryItem = categories.find(({ _id }) => _id === categoryId);
        if (categoryItem) {
            const { color, category } = categoryItem;
            const backgroundColor = convertHexToRGBA(color, 20);
            todosContainer.innerHTML += `
                <div class="todo" style="border-color: ${color}; display: flex; flex-direction: column;">
                    <div class="todo-tag" style="background-color: ${backgroundColor}; color: ${color};">
                        ${category}
                    </div>
                    <p class="todo-description">${todo}</p>
                    <div class="todo-footer">
                    <div class="todo-actions">
                        <i class="far fa-edit" data-edit-todo=${_id}></i>
                        <i class="far fa-trash-alt" data-delete-todo=${_id}></i>
                    </div>
                    <p class="todo-date">Fecha: ${date}</p>
                </div>`;
        } else {
            console.error(`Category with ID ${categoryId} not found`);
        }
    });
}




// HELPERS
function clearChildElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convertHexToRGBA(hexCode, opacity) {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
}

function getRandomHexColor() {
    var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return `#${hex}`;
}

window.addEventListener('load', render);

document.addEventListener('DOMContentLoaded', () => {
    const colorChangeBtn = document.getElementById('colorChangeBtn');
    const colorOptions = document.getElementById('colorOptions');

    // Event listener para abrir el panel de colores al hacer clic en el botón de cambio de color
    colorChangeBtn.addEventListener('click', function() {
        colorOptions.style.display = (colorOptions.style.display === 'block') ? 'none' : 'block';
    });

    // Cierra el panel de colores si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        if (colorOptions.style.display === 'block' && !colorOptions.contains(event.target) && event.target !== colorChangeBtn) {
            colorOptions.style.display = 'none';
        }
    });

    document.getElementById('colorOptions').addEventListener('click', function(e) {
        const selectedOption = e.target.getAttribute('value');
        if (selectedOption === 'main' || selectedOption === 'body' || selectedOption === 'main-header') {
            // Crear el elemento input de tipo color
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.id = 'colorPicker';
            colorPicker.style.display = 'none'; // Ocultar el color picker por defecto

            // Agregar el color picker al cuerpo del documento
            document.body.appendChild(colorPicker);

            // Abrir el color picker
            colorPicker.click();

            // Event listener para cambiar el color al seleccionar uno del selector de colores
            colorPicker.addEventListener('input', function() {
                const selectedColor = colorPicker.value;
                if (selectedOption === 'main') {
                    document.querySelector('.main').style.backgroundColor = selectedColor;
                    localStorage.setItem('mainColor', selectedColor); // Guardar el color en el almacenamiento local
                } else if (selectedOption === 'body') {
                    document.body.style.backgroundColor = selectedColor;
                    localStorage.setItem('bodyColor', selectedColor); // Guardar el color en el almacenamiento local
                } else if (selectedOption === 'main-header') {
                    document.querySelector('.main .header').style.backgroundColor = selectedColor;
                    localStorage.setItem('mainHeaderColor', selectedColor); // Guardar el color en el almacenamiento local
                }
            });

            // Event listener para cerrar el color picker cuando se hace clic fuera de él
            colorPicker.addEventListener('blur', function() {
                document.body.removeChild(colorPicker);
            });
        }
    });

    // Función para cargar el color almacenado del almacenamiento local
    function loadColor() {
        const mainColor = localStorage.getItem('mainColor');
        const bodyColor = localStorage.getItem('bodyColor');
        const mainHeaderColor = localStorage.getItem('mainHeaderColor');
        if (mainColor) {
            document.querySelector('.main').style.backgroundColor = mainColor;
        }
        if (bodyColor) {
            document.body.style.backgroundColor = bodyColor;
        }
        if (mainHeaderColor) {
            document.querySelector('.main .header').style.backgroundColor = mainHeaderColor;
        }
    }

    // Cargar el color al cargar la página
    window.addEventListener('load', loadColor);
});

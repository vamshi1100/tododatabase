var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class View {
    constructor(id) {
        this.selectedCategory = null;
        this.id = id;
        this.init();
        this.displayData();
    }
    init() {
        const mainContainer = document.querySelector(".maincontainer");
        const subContainerId = `subcontainer-${this.id}`;
        const containerId = `container-${this.id}`;
        const featuresId = `features-${this.id}`;
        mainContainer.innerHTML += `
      <div class="subcontainer" id="${subContainerId}">
        <div class="container" id="${containerId}">
          <h1>Todo List ${this.id}</h1>
          <div id="firstcontainer-${this.id}">
            <input type="text" id="input-${this.id}" placeholder="Enter some data" />
            <button id="add-${this.id}">Add</button>
            <div class="datebetween">
              <input type="date" id="startDate-${this.id}" class="datepick" />
              <input type="date" id="endDate-${this.id}" class="datepick" />
            </div>
            <div class="groupby">
              ${["Work", "Home", "Personal"]
            .map((cat) => `<button id="${cat.toLowerCase()}-${this.id}" class="groupbybtn">${cat}</button>`)
            .join("")}
            </div>
          </div>
          <div id="${containerId}">
            <div id="data-${this.id}"></div>
          </div>
        </div>
        <div class="features" id="${featuresId}">
          <div class="filter">
            <h1>Filter</h1>

            <button id="all${this.id}">all </button>
            <button id="completed${this.id}">completed </button>
            <button id="notcompleted${this.id}">not completed </button>

          </div>
          <div class="search">
            <h1>Search</h1>
            <input type="text" id="search-${this.id}" placeholder="Enter something to search" />
          </div>
            <div class="filterdate">
              <h1>Date Range Filter</h1>
              <input type="date" id="filterStartDate-${this.id}" />
              <input type="date" id="filterEndDate-${this.id}" />
              <button id="filterBtn-${this.id}">Filter</button>
            </div>
          <div class="groupbycategory">
            <h1>Group By</h1>
            <button id="homefilter${this.id}">home </button>
            <button id="workfilter${this.id}">work </button>
            <button id="personalfilter${this.id}">personal </button>
          </div>
        </div>
      </div>
    `;
        this.addEventListeners();
    }
    addEventListeners() {
        const mainContainer = document.querySelector(".maincontainer");
        mainContainer.addEventListener("click", (event) => {
            const target = event.target;
            if (target.classList.contains("groupbybtn")) {
                this.handleGroupByButtonClick(target);
            }
            if (target.id === `add-${this.id}`) {
                this.handleAddButtonClick();
            }
        });
    }
    handleGroupByButtonClick(target) {
        const groupButtons = document.querySelectorAll(`#firstcontainer-${this.id} .groupbybtn`);
        groupButtons.forEach((button) => {
            button.classList.remove("selected");
            button.style.border = "";
        });
        target.classList.add("selected");
        target.style.border = "4px solid red";
        this.selectedCategory = target.innerText;
    }
    handleAddButtonClick() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = document.getElementById(`input-${this.id}`).value;
            const startDated = document.getElementById(`startDate-${this.id}`).value;
            const endDated = document.getElementById(`endDate-${this.id}`).value;
            const selectedd = this.selectedCategory || "No category selected";
            yield this.addToDB(this.id, input, startDated, endDated, selectedd);
        });
    }
    addToDB(id, inputd, startDated, endDated, category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id,
                        inputd,
                        startDated,
                        endDated,
                        category,
                        checked: false,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                yield this.displayData();
            }
            catch (error) {
                console.error("Error adding to database:", error);
            }
        });
    }
    displayData() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const response = yield fetch("/getdata", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const { data } = yield response.json();
                const dataContainer = document.getElementById(`data-${this.id}`);
                dataContainer.innerHTML = "";
                const filteredData = data.filter((elem) => elem.id === this.id);
                filteredData.forEach((elem) => this.createTodoItem(elem, dataContainer));
                const updateDataDisplay = (items) => {
                    dataContainer.innerHTML = ""; // Clear previous data
                    items.forEach((elem) => this.createTodoItem(elem, dataContainer));
                };
                (_a = document
                    .getElementById(`all${this.id}`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                    updateDataDisplay(filteredData);
                });
                (_b = document
                    .getElementById(`completed${this.id}`)) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
                    const completedItems = filteredData.filter((elem) => elem.checked);
                    updateDataDisplay(completedItems);
                });
                (_c = document
                    .getElementById(`notcompleted${this.id}`)) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
                    const notCompletedItems = filteredData.filter((elem) => !elem.checked);
                    updateDataDisplay(notCompletedItems);
                });
                const searchInput = document.getElementById(`search-${this.id}`);
                searchInput.addEventListener("input", () => {
                    const searchTerm = searchInput.value.toLowerCase(); // Get the search term
                    const searchedItems = filteredData.filter((elem) => {
                        return elem.text && elem.text.toLowerCase().includes(searchTerm);
                    });
                    updateDataDisplay(searchedItems); // Update the display with filtered items
                });
                (_d = document
                    .getElementById(`filterBtn-${this.id}`)) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
                    const startDateInput = document.getElementById(`filterStartDate-${this.id}`);
                    const endDateInput = document.getElementById(`filterEndDate-${this.id}`);
                    const startDate = new Date(startDateInput.value);
                    const endDate = new Date(endDateInput.value);
                    const dateFilteredItems = filteredData.filter((dataItem) => {
                        const itemStartDate = new Date(dataItem.startDate);
                        const itemEndDate = new Date(dataItem.endDate);
                        return itemStartDate >= startDate && itemEndDate <= endDate;
                    });
                    updateDataDisplay(dateFilteredItems);
                });
                (_e = document
                    .getElementById(`homefilter${this.id}`)) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
                    let homefilter = filteredData.filter((data) => {
                        return data.category == "Home";
                    });
                    updateDataDisplay(homefilter);
                });
                (_f = document
                    .getElementById(`workfilter${this.id}`)) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
                    let workfilter = filteredData.filter((data) => {
                        return data.category == "Work";
                    });
                    updateDataDisplay(workfilter);
                });
                (_g = document
                    .getElementById(`personalfilter${this.id}`)) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
                    let personalfilter = filteredData.filter((data) => {
                        return data.category == "Personal";
                    });
                    updateDataDisplay(personalfilter);
                });
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
        });
    }
    createTodoItem(elem, container) {
        const datadiv = document.createElement("div");
        const todoItem = document.createElement("p");
        todoItem.innerText = `Text: ${elem.text}, Start: ${elem.startDate}, End: ${elem.endDate}, Category: ${elem.category}`;
        datadiv.appendChild(todoItem);
        const delButton = document.createElement("button");
        delButton.innerText = "Delete";
        delButton.id = `delbutton-${elem._id}`;
        delButton.addEventListener("click", () => this.deleteTodoItem(elem._id, datadiv));
        datadiv.appendChild(delButton);
        const check = document.createElement("input");
        check.type = "checkbox";
        check.id = `checkbox-${elem._id}`;
        check.checked = elem.checked;
        check.addEventListener("change", () => this.updateCheckboxStatus(elem._id, check.checked));
        datadiv.appendChild(check);
        container.appendChild(datadiv);
    }
    deleteTodoItem(id, datadiv) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/delete/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = yield response.json();
                console.log(result.message || "Todo item deleted successfully");
                datadiv.remove();
            }
            catch (error) {
                console.error("Error deleting todo item:", error);
            }
        });
    }
    updateCheckboxStatus(id, checked) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ checked }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                yield this.displayData();
            }
            catch (error) {
                console.error("Error updating checkbox status:", error);
            }
        });
    }
}
const viewInstance1 = new View(1);
const viewInstance2 = new View(2);

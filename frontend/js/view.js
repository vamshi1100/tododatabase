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
            ${["All", "Completed", "Not Completed"]
            .map((filter) => `<button id="filter${filter.toLowerCase()}-${this.id}">${filter}</button>`)
            .join("")}
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
            ${["Work", "Home", "Personal"]
            .map((cat) => `<button id="${cat.toLowerCase()}g-${this.id}" class="groupbycategoryfilter">${cat}</button>`)
            .join("")}
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

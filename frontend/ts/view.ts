export class View {
  public id: number;
  public selectedCategory: string | null = null;

  constructor(id: number) {
    this.id = id;
    this.init();
    this.displayData();
  }

  public init(): void {
    const mainContainer = document.querySelector(
      ".maincontainer"
    ) as HTMLElement;
    const subContainerId = `subcontainer-${this.id}`;
    const containerId = `container-${this.id}`;
    const featuresId = `features-${this.id}`;

    mainContainer.innerHTML += `
      <div class="subcontainer" id="${subContainerId}">
        <div class="container" id="${containerId}">
          <h1>Todo List ${this.id}</h1>
          <div id="firstcontainer-${this.id}">
            <input type="text" id="input-${
              this.id
            }" placeholder="Enter some data" />
            <button id="add-${this.id}">Add</button>
            <div class="datebetween">
              <input type="date" id="startDate-${this.id}" class="datepick" />
              <input type="date" id="endDate-${this.id}" class="datepick" />
            </div>
            <div class="groupby">
              ${["Work", "Home", "Personal"]
                .map(
                  (cat) =>
                    `<button id="${cat.toLowerCase()}-${
                      this.id
                    }" class="groupbybtn">${cat}</button>`
                )
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
              .map(
                (filter) =>
                  `<button id="filter${filter.toLowerCase()}-${
                    this.id
                  }">${filter}</button>`
              )
              .join("")}
          </div>
          <div class="search">
            <h1>Search</h1>
            <input type="text" id="search-${
              this.id
            }" placeholder="Enter something to search" />
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
              .map(
                (cat) =>
                  `<button id="${cat.toLowerCase()}g-${
                    this.id
                  }" class="groupbycategoryfilter">${cat}</button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  private addEventListeners(): void {
    const mainContainer = document.querySelector(
      ".maincontainer"
    ) as HTMLElement;

    mainContainer.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("groupbybtn")) {
        this.handleGroupByButtonClick(target);
      }

      if (target.id === `add-${this.id}`) {
        this.handleAddButtonClick();
      }
    });
  }

  private handleGroupByButtonClick(target: HTMLElement): void {
    const groupButtons = document.querySelectorAll(
      `#firstcontainer-${this.id} .groupbybtn`
    ) as NodeListOf<HTMLButtonElement>;

    groupButtons.forEach((button) => {
      button.classList.remove("selected");
      button.style.border = "";
    });

    target.classList.add("selected");
    target.style.border = "4px solid red";
    this.selectedCategory = target.innerText;
  }

  private async handleAddButtonClick(): Promise<void> {
    const input = (
      document.getElementById(`input-${this.id}`) as HTMLInputElement
    ).value;
    const startDated = (
      document.getElementById(`startDate-${this.id}`) as HTMLInputElement
    ).value;
    const endDated = (
      document.getElementById(`endDate-${this.id}`) as HTMLInputElement
    ).value;
    const selectedd = this.selectedCategory || "No category selected";
    await this.addToDB(this.id, input, startDated, endDated, selectedd);
  }

  private async addToDB(
    id: number,
    inputd: string,
    startDated: string,
    endDated: string,
    category: string
  ): Promise<void> {
    try {
      const response = await fetch("/add", {
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

      await this.displayData();
    } catch (error) {
      console.error("Error adding to database:", error);
    }
  }

  private async displayData(): Promise<void> {
    try {
      const response = await fetch("/getdata", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { data } = await response.json();
      const dataContainer = document.getElementById(
        `data-${this.id}`
      ) as HTMLElement;
      dataContainer.innerHTML = "";

      const filteredData = data.filter(
        (elem: { id: number }) => elem.id === this.id
      );
      filteredData.forEach((elem: any) =>
        this.createTodoItem(elem, dataContainer)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  private createTodoItem(
    elem: {
      _id: number;
      text: string;
      startDate: string;
      endDate: string;
      checked: boolean;
      category: string;
    },
    container: HTMLElement
  ): void {
    const datadiv = document.createElement("div");

    const todoItem = document.createElement("p");
    todoItem.innerText = `Text: ${elem.text}, Start: ${elem.startDate}, End: ${elem.endDate}, Category: ${elem.category}`;
    datadiv.appendChild(todoItem);

    const delButton = document.createElement("button");
    delButton.innerText = "Delete";
    delButton.id = `delbutton-${elem._id}`;
    delButton.addEventListener("click", () =>
      this.deleteTodoItem(elem._id, datadiv)
    );
    datadiv.appendChild(delButton);

    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = `checkbox-${elem._id}`;
    check.checked = elem.checked;
    check.addEventListener("change", () =>
      this.updateCheckboxStatus(elem._id, check.checked)
    );
    datadiv.appendChild(check);

    container.appendChild(datadiv);
  }

  private async deleteTodoItem(
    id: number,
    datadiv: HTMLDivElement
  ): Promise<void> {
    try {
      const response = await fetch(`/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.message || "Todo item deleted successfully");
      datadiv.remove();
    } catch (error) {
      console.error("Error deleting todo item:", error);
    }
  }

  private async updateCheckboxStatus(
    id: number,
    checked: boolean
  ): Promise<void> {
    try {
      const response = await fetch(`/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await this.displayData();
    } catch (error) {
      console.error("Error updating checkbox status:", error);
    }
  }
}

const viewInstance1 = new View(1);
const viewInstance2 = new View(2);

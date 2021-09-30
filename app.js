const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const databasePath = path.join(__dirname, "todoApplication.db");
const { isValid } = require("date-fns");
const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDataObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const validateQueryPriority = (request, response, next) => {
  const { priority } = request.query;
  if (
    priority === undefined ||
    priority === "HIGH" ||
    priority === "LOW" ||
    priority === "MEDIUM"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const validateQueryStatus = (request, response, next) => {
  const { status } = request.query;
  if (
    status === undefined ||
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const validateQueryCategory = (request, response, next) => {
  const { category } = request.query;
  if (
    category === undefined ||
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const validateBodyPriority = (request, response, next) => {
  const { priority } = request.body;
  if (
    priority === undefined ||
    priority === "HIGH" ||
    priority === "LOW" ||
    priority === "MEDIUM"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const validateBodyStatus = (request, response, next) => {
  const { status } = request.body;
  if (
    status === undefined ||
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const validateBodyCategory = (request, response, next) => {
  const { category } = request.body;
  if (
    category === undefined ||
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const validateQueryDate = (request, response, next) => {
  const { date } = request.query;
  if (isValid(new Date(date))) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

const validateBodyDate = (request, response, next) => {
  const { dueDate } = request.body;
  console.log(dueDate);
  if (dueDate === undefined || isValid(new Date(dueDate))) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

app.get(
  "/todos/",
  validateQueryPriority,
  validateQueryStatus,
  validateQueryCategory,
  async (request, response) => {
    let data = null;
    let getTodosQuery = "";
    const { search_q = "", priority, status, category } = request.query;

    switch (true) {
      case hasPriorityAndStatusProperties(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        break;
      case hasPriorityProperty(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        break;

      case hasStatusProperty(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        break;

      case hasCategoryAndStatusProperties(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        category = "${category}
        AND status = "${status}";`;
        break;
      case hasCategoryProperty(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        category = "${category}";`;
        break;
      case hasCategoryAndPriorityProperties(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        category = "${category}"
        AND priority = "${priority}";`;
        break;
      case hasSearchProperty(request.query):
        getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%';`;
        break;
    }

    data = await database.all(getTodosQuery);
    response.send(
      data.map((eachData) => convertDataObjectToResponseObject(eachData))
    );
  }
);

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(convertDataObjectToResponseObject(todo));
});

app.get("/agenda/", validateQueryDate, async (request, response) => {
  const { date } = request.query;
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = "${formattedDate}";`;
  const data = await database.all(getTodoQuery);
  response.send(
    data.map((eachData) => convertDataObjectToResponseObject(eachData))
  );
});

app.post(
  "/todos/",
  validateBodyDate,
  validateBodyPriority,
  validateBodyStatus,
  validateBodyCategory,
  async (request, response) => {
    const { id, todo, category, priority, status, dueDate } = request.body;
    const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
    const postTodoQuery = `
    INSERT INTO
        todo (id, todo, category, priority, status, due_date)
    VALUES
        (${id}, '${todo}', '${category}', '${priority}', '${status}', '${formattedDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
);

app.put(
  "/todos/:todoId/",
  validateBodyDate,
  validateBodyPriority,
  validateBodyStatus,
  validateBodyCategory,
  async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    switch (true) {
      case requestBody.status !== undefined:
        updateColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updateColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updateColumn = "Todo";
        break;
      case requestBody.category !== undefined:
        updateColumn = "Category";
        break;
      case requestBody.dueDate !== undefined:
        updateColumn = "Due Date";
        break;
    }
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const previousTodo = await database.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.due_date,
    } = request.body;
    const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${formattedDate}'
    WHERE
      id = ${todoId};`;

    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  }
);

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

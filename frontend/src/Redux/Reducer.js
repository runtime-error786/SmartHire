
const Role_Reducer = (state = "Candidate", action) => {
    if (action.type === "Role") {
      return action.payload;
    }
    return state;
  };
  
export {Role_Reducer}
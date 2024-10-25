import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// as a sample some functions of actions take help from that 

export const Auth = (role) => {
  return async (dispatch) => {
    try {
      console.log("hi i am run")
      const response = await axios.get(`http://127.0.0.1:3001/get_user_role?role=${role}`, { withCredentials: true });
      console.log("reduu",response)
     
        dispatch({
          type: "Role",
          payload: response.data.role
        });
        
    } catch (error) {
      console.log("err")
      dispatch({
        type: "Role",
        payload:"Guest"
      });
    }
  };
};

// export const NextPage = (page) => ({
//   type: 'NEXT_PAGE',
//   payload: page
// });

export const Role_Action = (page) => ({
  type: 'Role',
  payload: page
});
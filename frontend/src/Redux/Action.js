import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// as a sample some functions of actions take help from that 

// export const Auth = () => {
//   return async (dispatch) => {
//     try {
//       console.log("hi i am run")
//       const response = await axios.get("http://localhost:8001/auth", { withCredentials: true });
//       console.log("reduu",response.data.role)
//       if(response.data.role=="customer" || response.data.role=="admin")
//       {
//         dispatch({
//           type: "Role",
//           payload: response.data.role
//         });
//         console.log("in if",response);
//       }
//       else{
//         dispatch({
//           type: "Role",
//           payload:"Guest"
//         });
//       }
//     } catch (error) {
//       console.log("err")
//       dispatch({
//         type: "Role",
//         payload:"Guest"
//       });
//     }
//   };
// };

// export const NextPage = (page) => ({
//   type: 'NEXT_PAGE',
//   payload: page
// });

export const Role_Action = (page) => ({
  type: 'Role',
  payload: page
});
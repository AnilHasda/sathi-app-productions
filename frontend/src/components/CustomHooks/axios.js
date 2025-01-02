import axios from 'axios';
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
const useAxiosInstance=()=>{
  const navigate=useNavigate();
const axiosInstance = axios.create({
  baseURL: 'https://sathi-app-backend.onrender.com/api/v1/', 
  withCredentials:true
});
axiosInstance.interceptors.response.use(
  response=>response,
  error=>{
    const {status}=error.response;
    if(status===401) {
      toast.error("Session Expired ! Please log in again");
    navigate("/auth/login");
    }
    return Promise.reject(error);
  }
  )
  return axiosInstance;
}

export default useAxiosInstance;

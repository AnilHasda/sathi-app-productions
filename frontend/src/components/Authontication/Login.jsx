import {useState} from "react";
import {Label} from "../../shadcnComponents/ui/label";
import {Input} from "../../shadcnComponents/ui/input";
import {Button} from "../../shadcnComponents/ui/button";
import Toast from "react-hot-toast";
import {updateAuthontication} from "../../Redux/Slices/Authontication.Slice";
import {updateProfileData} from "../../Redux/Slices/profile";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import useAxiosInstance from "../CustomHooks/axios";
import useGetInitialInfo from "../CustomHooks/useGetInitialInfo";
import { ClipLoader} from 'react-spinners';
import {initializeSocket} from "../../Redux/Slices/Socket";
import {motion} from "framer-motion";
const LoginPage=()=>{
  let [formData,setFormData]=useState({});
  let [loading,setLoading]=useState(false);
  let axiosInstance=useAxiosInstance();
  let getInitialInfo=useGetInitialInfo();
  let dispatch=useDispatch();
  let navigate=useNavigate();
  const handleInput=(e)=>{
    let {name,value}=e.target;
    setFormData(prev=>({...prev,[name]:value}));
  }
  //function that loads notifications
  
  //function that update profile pic in Redux
  const getProfile=async (email)=>{
    try{
    let {data}=await axiosInstance.get(`/auth/getProfile?email=${email}`);
    if(data?.success){
      dispatch(updateProfileData({profile:data.data?.profile,loggedInUserInfo:data.data}));
    }
    }catch(error){
      alert(error.response.data.message);
    }
  }
  
  const login=async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      let {data}=await axiosInstance.post("/auth/login",formData);
      if(data?.success){
        dispatch(initializeSocket());
        getInitialInfo();
        dispatch(updateAuthontication(true));
        dispatch(updateProfileData({email:formData.email}));
        setTimeout(()=>{
          getProfile(formData.email);
        },100);
      Toast.success(data?.message);
      console.log(data.message)
      setFormData({});
      navigate("/");
      }
    }catch(error){
      console.log(error);
      dispatch(updateAuthontication(false));
      Toast.error(error?.response?.data?.message || "something went wrong!!");
    }finally{
      setLoading(false);
    }
  }
  return (
    <>
      <motion.form 
      className="w-auto pt-5"
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{delay:.5,duration:1}}
      onSubmit={login}
      >
        <div className=" w-[300px] m-auto">
          <motion.div 
          className="text-center mb-5 text-emerald-900 font-bold"
          initial={{x:"-100vw"}}
          animate={{x:0}}
          transition={{delay:1.5,duration:.5,type:"spring",stiffness:100}}
          >Login Form</motion.div>
        <label htmlFor="email">Email</label><br/>
        <input type="email"placeholder="Enter your email"id="email"className="h-10 w-full border border-[gray] rounded-sm mb-[10px] mt-[10px] text-sm pl-1"value={formData.email || ""}name="email"onChange={handleInput}required/><br/>
         <label htmlFor="password">Password</label><br/>
        <input type="password"placeholder="Enter your password"id="password"className="h-10 w-full border border-[gray] rounded-sm mb-[10px] mt-[10px] text-sm pl-1"value={formData.password || ""}name="password"onChange={handleInput}required/><br/>
        <Button type="submit"className="w-full mt-1">
          {loading ? <ClipLoader size={20} color="#fff"/>:"submit"}
          </Button>
        </div>
      </motion.form>
    </>
    )
}
export default LoginPage;
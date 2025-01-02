import {useEffect,useState} from "react";
import {useSelector,useDispatch} from "react-redux";
import useAxiosInstance from "../CustomHooks/axios";
import {Button} from "../../shadcnComponents/ui/button";
import {Drawer,DrawerTrigger} from "../../shadcnComponents/ui/drawer";
import SearchUsers from "../Utils/SearchUsers";
import { ClipLoader} from 'react-spinners';
import {updateViewProfile} from "../../Redux/Slices/profile";
import useSendRequest from "../CustomHooks/useSendRequest.js";
import useUpdateRequest from "../CustomHooks/useUpdateRequest";
import useAxiosPost from "../CustomHooks/AxiosPost";
import {updateChatInfo} from "../../Redux/Slices/Chat";
import {useNavigate} from "react-router-dom";
import Toast from "react-hot-toast";
 const ViewProfile=()=>{
  
  let [friendData,setFriendData]=useState([]);
  //this id store id of current user to compate current user and after rendering viewptofile user id is same or not to call function to retrieve friends detail
  let [currentUserId,setCurrentUserId]=useState(null);
  let [friends,setFriends]=useState([]);
  let [loading,setLoading]=useState(false);
  let [error,setError]=useState(null);
  let {viewProfileData}=useSelector(state=>state.userData);
  console.log({viewProfileData})
  let axiosInstance=useAxiosInstance();
  let {postData:createChat,data:chatResponse,loading:chatCreationLoading,error:singleChatCreationError}=useAxiosPost();
  let navigate=useNavigate();
    /**********************************
  /** this one is for single chat
   *********************************/
  useEffect(()=>{
     console.log({chatResponse})
     if(chatResponse) navigate(`/chat/${chatResponse.data.chatId}`)
  },[chatResponse])
  //create single chat
  const createSingleChat=async (_id,username,profile)=>{
    if(!chatCreationLoading){
    let profileDetail={username,profile,_id}
    console.log({profileDetail})
    let chatInfo={isGroupChat:false,profileDetail};
    dispatch(updateChatInfo({currentChatInfo:chatInfo}));
    let memberId=_id;
    await createChat("/chat/createSingleChat",{memberId})
    }
  }

  /**********************************
  /** this one is for AxiosPost
   *********************************/
   let {postData,data:mutualFriends,loading:postLoading,error:postError}=useAxiosPost();
  let dispatch=useDispatch();
  console.log(viewProfileData)
  
  let {sendRequest,loading:sendRequestLoading,loadingId,data,error:sendRequestError}=useSendRequest();
  let {updateRequestStatus,data:requestData,error:requestUpdateError,loading:requestUpdateLoading,
    data:updateData,
    updateRequestLoadingId}=useUpdateRequest();
  
  //this one is for sending request
  useEffect(()=>{
    if(error) Toast.error(error?.response?.data?.message || "please check you network!");
    
      if(data?.data?.success) Toast.success(data?.data?.message);
  },[sendRequestError,data])
  
  //this one is for updating request
  useEffect(()=>{
    if(requestUpdateError) Toast.error(requestUpdateError?.response?.updateData?.message || "please check your network!");
    if(updateData?.data?.success) Toast.success(updateData?.data?.message);
  },[updateData,requestUpdateError])

  const updateFriendStatus=(ele)=>{
        ele.status==="none" &&
            sendRequest(ele._id,ele.status);
            ele.status==="pending" &&
            (ele.youSendRequest ?
            updateRequestStatus(ele.requestId,"cancelled",ele._id)
            :
            updateRequestStatus(ele.requestId,"accepted",ele._id)
            )
            }
  useEffect(()=>{
    alert(currentUserId+"___"+viewProfileData._id)
    setCurrentUserId(prev=>(prev===viewProfileData._id));
    if(currentUserId===null ||
    currentUserId !=viewProfileData._id){
    (async ()=>{
      try{
        setLoading(true);
      let {data}=await axiosInstance.get(`friend/getFriendsList/${viewProfileData?.friend?._id||viewProfileData._id}`);
      if(data.success){
        console.log(data.data || "no data found")
        setLoading(false);
      setFriendData(data?.data || []);
      let friendForSeeAllSection=data?.data?.length>0 && data?.data.slice(0,6);
      setFriends(friendForSeeAllSection);
      }
      }catch(error){
        console.log(error);
        if(error.request) setError("Network Error! please check your network");
        else if(error.response) setError(error.response?.data?.message);
        else setError("something went wrong! please try again later !!");
      }finally{
        setLoading(false);
      }
    })();
    }
  },[viewProfileData,currentUserId])
  
  //function for updating Button
  const updateButtonContent=(status)=>{
    switch(status){
      case "accepted":
        return "Friends"
      case "rejected":
        return "Add Friend"
      case "pending":
        return "cancel"
      default: return "Add Friend"
    }
  }
  
  //classname for Button
  const updateClassName=()=>{
    if(viewProfileData.mutualFriends || viewProfileData.status==="accepted" || viewProfileData.status==="pending"){
        return "text-[black]";
    }
   else if(viewProfileData.status==="rejected"){
      return "bg-[#3b5998] text-[#f1f1f1]";
    }
    else{
      return "bg-[#3b5998] text-[#f1f1f1]";
    }
  }
  
  // function to change variant
  function changeVariant(status){
     if(status !== "none") return "secondary";
     return null;
  }
  //function to delete request
  const deleteRequest=(ele)=>{
    if(ele.status==="pending"&& ele.otherSendRequest){
        updateRequestStatus(ele.requestId,"rejected",ele._id)
   }
  }
  return (
    <>
      {
         (!error && viewProfileData?._id ) ?
        <>
          <div className="h-[150px] w-full border-b-2 bg-[#f1f1f1] relative">
         
          <div className="h-[130px] w-[130px] bg-slate-900 rounded-full absolute bottom-[-60px] left-[30px]"
            style={{
            backgroundImage:`url(${viewProfileData?.friend?.profile || viewProfileData.profile})`,
            backgroundPosition:"center",
            backgroundSize:"cover"
          }}
          ></div>
        </div>
          {/*Profile detail section*/}
          <div className="mt-[70px] pb-5 pl-[30px] border-b-2">
           <div className="mt-4"><p className="font-bold text-2xl">{viewProfileData?.friend?.username || viewProfileData.username}</p></div>

          <div className="mt-3">
            <p className="font-bold inline">{friendData?.length}</p>
            <p className="inline text-gray-500"> Friends</p>
           {!viewProfileData.isLoggedInUser && viewProfileData.totalMutualFriends>0 &&
              <>
              {/*Drawer starts from here */}
              <Drawer>
                <DrawerTrigger>
                  <div onClick={()=>{postData("friend/getMutualFriends",viewProfileData.mutualFriendsId)}}>
             <p className="font-bold inline pl-8">{viewProfileData?.totalMutualFriends || 0} </p>
            
            <p className="inline text-gray-500"> Mutual Friends</p>
            </div>
            </DrawerTrigger>
            <SearchUsers users={mutualFriends?.data}/>
            </Drawer>
          {/* Drawer closed */}
          </>
            }

          <div className="mt-3">
            {viewProfileData.isLoggedInUser ?
            <Button variant="secondary">Edit Profile</Button>
            :
           <Button variant={changeVariant(viewProfileData.status)}
            className={    updateClassName()
            }
            disabled={viewProfileData.status==="rejected"}
            onClick={()=>{
              updateFriendStatus(viewProfileData)
               }
            }
            >
             {
             sendRequestLoading || (viewProfileData.youSendRequest  && requestUpdateLoading) ?
             <ClipLoader/>
             :
             updateButtonContent(viewProfileData.status)
            }
            </Button>
            }
            { viewProfileData.status==="pending" && viewProfileData.otherSendRequest &&
              <Button variant="secondary"
              onClick={
              ()=>{
                deleteRequest(viewProfileData);
              }
              }
              >{
              requestUpdateLoading ?
              <ClipLoader />
              :
                "Delete"
              }
                </Button>
            }
            {
            !viewProfileData.isLoggedInUser &&
            (viewProfileData.hasOwnProperty("mutualFriends") && viewProfileData.mutualFriends && viewProfileData.status==="accepted") &&
            (
            <Button className="bg-[#3b5998] ml-5 text-[#f1f1f1]"
            onClick={
         ()=>{
  let memberId=viewProfileData?.friend?._id || viewProfileData._id;
  let username=viewProfileData?.friend?.username || viewProfileData.username;
  let profile=viewProfileData?.friend?.profile || viewProfileData.profile
     createSingleChat( memberId,username,profile)
              }
            }
            >
              {
              chatCreationLoading
              ?<ClipLoader size={25} className="text-white"/>
              :
              "Message"
                
              }
             </Button>
             )
            }
            {        
            !viewProfileData.hasOwnProperty("mutualFriends") &&
            (!viewProfileData.isLoggedInUser &&
             viewProfileData.status==="accepted") && (
               <Button className="bg-[#3b5998] ml-5 text-[#f1f1f1]"
         onClick={
         ()=>{
        let memberId=viewProfileData?.friend?._id || viewProfileData._id;
       let username=viewProfileData?.friend?.username || viewProfileData.username;
        let profile=viewProfileData?.friend?.profile || viewProfileData.profile
     createSingleChat( memberId,username,profile)
              }
            }
               >
            {
              chatCreationLoading
              ?<ClipLoader size={25} className="text-white"/>
              :
              "Message"
                
              }
             </Button>
             )
             
            }
            </div>
          </div>
          </div>
          {/*Friend/See all section*/}
          {loading ?
         <div className="text-center pt-5"><ClipLoader/></div>
          :
          friendData.length>0 ?
          <div>
            
            <div className="h-auto w-full px-5 py-5 flex justify-between">
              
              <div>
                <p className="font-bold">Friends</p>
                {!viewProfileData.isLoggedInUser?
                <p className="text-gray-500">{friendData.length} (10 mutual)</p>
                :
                <p className="text-gray-500">{friendData.length} friends</p>
                }
                </div>
                {friendData.length>0 && friends.length>6 &&
              <div className="font-bold"><p>See All</p></div>
                }
            </div>
            {/*show friends list*/}
            <div className="grid grid-cols-3 gap-2 px-5">
            {friends.map((ele)=>(
            <div key={ele?._id} onClick={()=>{dispatch(updateViewProfile(ele));}}>
              <div className="h-[100px] bg-gray-600 rounded-sm"
              style={{
               backgroundImage:`url(${ele?.friend.profile})`,
                backgroundPosition:"center",
                backgroundSize:"cover"
          }}
             ></div>
             <div><p className=" text-center font-bold py-1">{ ele?.friend.username?.slice(0,10)}...</p></div>
             </div>
            ))}
            </div>
          </div>
          :
          <p className="pl-5 pt-5 text-[red]">{!viewProfileData.isLoggedInUser ?
          viewProfileData.username+" " 
            :"You "
          } have not any friends yet</p>
          }
        </>
        :
        <div className="pt-5 text-center text-red-900">{error}</div>
        }
      </>
      )
 }
      
export default ViewProfile;
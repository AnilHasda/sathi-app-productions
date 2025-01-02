import {DropdownButton} from "../../shadcnComponents/ui/dropdown-button";
import {motion} from "framer-motion";
const Header=()=>{
  return(
    <>
    <motion.nav 
    className="h-14 w-full  flex justify-between items-center pl-5 pr-2 fixed top-0 z-10 box-border grow-0 border backdrop-blur shadow-sm"
    initial={{y:-50}}
    animate={{y:0}}
    transition={{type:"spring",stiffness:120}}
    >
      <p className="font-bold text-emerald-900 text-xl">Sathi App</p>
      <DropdownButton />
    </motion.nav>  
    </>
    )
}
export default Header;
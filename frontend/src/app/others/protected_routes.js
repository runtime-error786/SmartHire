import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { Auth } from '@/Redux/Action';
import Loader from './loader';


const Protect = ({ children }) => {
    const role = useSelector((state) => state.Role_Reducer);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const router = usePathname();
    const route = useRouter();

    useEffect(() => {
        setLoading(true);

        const delayTimeout = setTimeout(() => {
            dispatch(Auth(role)).then(() => {
                setLoading(false);
            });
        }, 1000); 

        return () => clearTimeout(delayTimeout);
    }, [router]);

    if (loading) {
        return <>
          <Loader></Loader>
        </>;
    }

    console.log("role", role);

    if (role === "admin") {
        console.log("admin role")
        if ( router === "/admin" || router === "/admin/addadmin" || router === "/admin/addproduct" ||  router === "/error" || router === "/admin/deladmin" || router === "/admin/delprod" || router === "/admin/updateprod" || router === "/admin/dashboard" || router === "/admin/profile") {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
    } else if (role === "Candidate") {
        console.log("customer role")

        if (
            router=="/Users/Home"   || router=="/Users/Jobs"  ||
            router=="/Users/Notifications"  || router=="/Users/Profile"  ||  router=="/Users/Practice"  || 
            router==="/error"
        ) {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
        
    }
    else if (role === "Recruiter") {
        console.log("customer role")

        if (
            router=="/Users/Home"   || router=="/Users/Posts"  ||
            router=="/Users/Notifications"  || router=="/Users/Profile"  ||
            router==="/error"
        ) {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
        
    }
     else if (role === "Guest") {
        console.log("guest role")

        if (
            router=="/Users/Home" ||
            router=="/Users/SignIn" ||
            router=="/Users/SignUp" 
        ) {
            return <>{children}</>;
        } else {
            route.push("/Users/SignIn");
            return null;
        }
    } 
}

export default Protect;
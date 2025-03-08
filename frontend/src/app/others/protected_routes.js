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


    if (role === "admin") {
        if ( router === "/Admin/deleteusers" || router === "/Admin/deletesubscription" || router === "/Admin/dashboard"||  router === "/error"  || router === "/Admin/deletejob" || router === "/Admin/report") {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
    } else if (role === "Candidate") {

        if (
            router=="/Users/Home"   || router=="/Users/Jobs"  ||
            router=="/Users/Savejobs"  || router=="/Users/Profile"  || 
            router==="/error" ||  router.startsWith("/Users/Jobs/") || router.startsWith("/Users/Practice")
        ) {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
        
    }
    else if (role === "Recruiter") {

        if (
            router=="/Users/Home"   || router=="/Users/Posts"  ||
            router=="/Users/Savejobs"  || router=="/Users/Profile"  ||
            router==="/error" || router=="/Users/Posts/CreateJob " || router.startsWith("/Users/Posts/")
        ) {
            return <>{children}</>;
        } else {
            route.push("/error");
            return null;
        }
        
    }
     else if (role === "Guest") {

        if (
            router=="/Users/Home" ||
            router=="/Users/SignIn" ||
            router=="/Users/SignUp" 

        ) {
            return <>{children}</>;
        } else {
            route.push("/Users/Home");
            return null;
        }
    } 
}

export default Protect;
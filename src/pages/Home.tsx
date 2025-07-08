import { nanoid } from "nanoid";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setUser } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
export default function Home() {
    const navigate = useNavigate();
    const dispatch  = useDispatch<AppDispatch>();
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [roomId, setRoomId] = useState("");
    const [toastVisible,setToastVisible] = useState(false);
    const [toastMessage,setToastMessage] = useState("");
    const handleHost = async () => {
        if (name.length == 0) {
            setToastMessage("Name is required.");
            setToastVisible(true);
            setTimeout(()=>setToastVisible(false),1500);
            return;
        }
        const uniqueId: string = nanoid(7);
        setRoomId(uniqueId);
        const user = {
            avatar,
            name,
            roomId:uniqueId
        };
        dispatch(setUser(user));
        
        navigate(`/room/${uniqueId}`);
    }
    const handleJoin = async()=>{
        if (name.length == 0) {
            setToastMessage("Name is required.");
            setToastVisible(true);
            setTimeout(()=>setToastVisible(false),1500);
            return;
        }
        if (roomId.length == 0) {
            setToastMessage("Room Id is required when joining.");
            setToastVisible(true);
            setTimeout(()=>setToastVisible(false),1500);
            return;
        }
        const user = {
            avatar,
            name,
            roomId
        };
        dispatch(setUser(user));
        
        navigate(`/room/${roomId}`);
    }
    return (
        <div className="h-[100%] w-[100%] flex flex-col items-center pt-20 gap-y-25">
            <div className="flex flex-col items-center">
                <h1 className=" text-5xl lg:text-8xl font-bold tracking-wide mb-10">BroRoom</h1>
                <h3 className="text-xl">Real-time vibes with real ones.</h3>
            </div>
            <div className="flex flex-col gap-y-6">
                <input type="text" onChange={(e) => { setName(e.target.value) }} placeholder="Get A Name First" className="input" />
                <input type="text" onChange={(e) => { setAvatar(e.target.value) }} placeholder="Your Photo Url" className="input" />
                <div className="flex gap-x-2 items-center">
                    <input className="input" type="text" onChange={(e) => { setRoomId(e.target.value) }} value={roomId} placeholder="Room Id" />
                    <button className="btn btn-primary" onClick={handleJoin} type="button">Join Room</button>
                </div>
                <h3 className="text-center text-xl">Or</h3>
                <button className="btn btn-primary" type="button" onClick={handleHost}>Host Room</button>
            </div>
            <div className={`toast ${toastVisible?'block':'hidden'}`}>
                <div className="alert alert-error text-white font-semibold">
                    <span>{toastMessage}</span>
                </div>
            </div>
        </div>
    )
}
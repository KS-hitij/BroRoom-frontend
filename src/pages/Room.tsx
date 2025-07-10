import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "../store"
import { useEffect, useState, useRef } from "react";
import { getSocket, setSocket } from "../utils/socketInstance";
import { clearUser } from "../features/user/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
type ChatMessage = {
    type: string,
    payload: {
        name: string,
        avatar: string,
        roomId: string,
        message: string
    }
};
type participant = {
    type: string,
    payload: {
        name: string,
        avatar: string
    }
}
export default function Room() {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.userReducer);
    const dispatch = useDispatch<AppDispatch>()
    const [message, setMessage] = useState("");
    const [texts, setTexts] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<participant[]>([]);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [socketReady,setSocketReady] = useState(false);
    useEffect(() => {
        const ws: WebSocket = new WebSocket("wss://broroom-backend.onrender.com/");
        setSocket(ws);
        let id: ReturnType<typeof setInterval>;

        const isHosting = location.state.isHosting;
        ws.onopen = () => {
            setSocketReady(true);
            if (isHosting) {
                ws.send(JSON.stringify({
                    type: "host",
                    payload: {
                        name: user.name,
                        avatar: user.avatar,
                        roomId: user.roomId
                    }
                }))
            }
            else {
                ws.send(JSON.stringify({
                    type: "join",
                    payload: {
                        name: user.name,
                        avatar: user.avatar,
                        roomId: user.roomId
                    }
                }))
            }

            ws.send(JSON.stringify({
                type: "users",
                payload: {
                    roomId: user.roomId
                }
            }));
            id = setInterval(() => {
                ws.send(JSON.stringify({
                    type: "users",
                    payload: {
                        roomId: user.roomId
                    }
                }))
            }, 1000);
        }

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log(data);
            if (data.type === "chat")
                setTexts(t => [...t, data]);
            else if (data[0].type === "users") {
                setParticipants(data)
            }
            else if (data.type === "error") {
                setToastMessage(data.payload.message);
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 1000);
                setTimeout(() => {
                    clearInterval(id);
                    navigate("/");
                }, 1300);
            }
        }

        return () => {
            clearInterval(id);
            ws.close();
        };
    }, [user.avatar, user.name, user.roomId, navigate,location]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [texts])

    const sendChat = () => {
        const ws = getSocket();
        ws.send(JSON.stringify({
            type: "chat",
            payload: {
                name: user.name,
                avatar: user.avatar,
                roomId: user.roomId,
                message
            }
        }))
        setMessage("");
    }

    const leaveRoom = () => {
        const ws = getSocket();
        ws.send(JSON.stringify({
            type: "leave",
            payload: {
                name: user.name,
                avatar: user.avatar,
                roomId: user.roomId
            }
        }))
        dispatch(clearUser());
        navigate("/");
    }
    if (!socketReady) {
        return (
            <div className="h-[100%] w-[100%] flex justify-center items-center">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        )
    }
    return (
        <div className="h-[100%] w-[100%] flex  flex-col lg:flex-row bg-base-300 relative">
            <div className="h-[100%] hidden lg:flex flex-col pt-6 lg:w-[25%] ">
                <div className="w-full mb-15">
                    <h1 className="text-center mb-5">Room Id: {user.roomId}</h1>
                    <h1 className="text-5xl font-bold text-center">Users</h1>
                </div>
                <div className="flex w-full justify-center text-3xl flex-wrap gap-x-10 gap-y-15 font-bold mb-10">
                    {participants.map((p, idx) => {
                        return (
                            <div className="flex flex-col items-center">
                                <div className="avatar">
                                    <div className="w-16 rounded-full">
                                        <img src={p.payload.avatar ? p.payload.avatar : "/assets/default.jpg"} alt="" />
                                    </div>
                                </div>
                                <h1 key={idx}>{p.payload.name}</h1>
                            </div>
                        )
                    })}
                </div>
                <div className="w-full text-center">
                    <button type="button" onClick={leaveRoom} className="btn btn-error text-white font-bold btn-lg">Leave</button>
                </div>
            </div>
            <div className="navbar flex px-5 justify-between z-20 sticky top-0 lg:hidden h-[10%] bg-base-300">
                <h1 className="text-center text-xl font-semibold">Room Id: {user.roomId}</h1>
                <div className="dropdown">
                    <div title="aufha" tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm  dropdown-content gap-y-1 flex flex-col items-center right-0 bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li className="w-full"><button type="button" onClick={leaveRoom} className="btn btn-error mb-5 text-white font-bold btn-md">Leave</button></li>
                        <li><h1 className="text-xl font-semibold">Users</h1></li>
                        {participants.map((p, idx) => {
                            return (
                                <li className="w-full">
                                    <div className="flex justify-start w-full">
                                        <div className="avatar">
                                            <div className="w-8 rounded-full">
                                                <img src={p.payload.avatar ? p.payload.avatar : "/assets/default.jpg"} alt="" />
                                            </div>
                                        </div>
                                        <h1 key={idx}>{p.payload.name}</h1>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            <div className="w-[100%] lg:w-[75%] h-[90%] lg:h-[100%] bg-base-100 py-1 px-0.5 flex flex-col justify-end ">
                <div className="flex px-3 flex-col gap-y-3 h-[94%] text-xl overflow-y-scroll">
                    {
                        texts.map((t, idx) => (
                            <div className="chat chat-start" key={idx}>
                                <div className="chat-image avatar">
                                    <div className="w-12 rounded-full"><img src={t.payload.avatar.length > 0 ? t.payload.avatar : "/assets/default.jpg"} alt="" /></div>
                                </div>
                                <div className="chat-footer text-lg">{t.payload.name}</div>
                                <div className="chat-bubble">{t.payload.message}</div>
                            </div>
                        ))
                    }
                    <div ref={bottomRef} />
                </div>
                <div className="h-[10%] lg:h-[6%] bottom-0 w-full flex sticky lg:justify-around">
                    <input type="text" onKeyDown={(e) => { if (e.key === "Enter") { sendChat() } }} onChange={(e) => setMessage(e.target.value)} value={message}
                        className="input w-[85%] sm:w-[92%] active:outline-0 text-xl" placeholder="Message here" />
                    <button type="button" onClick={sendChat} className="btn w-[15%] btn-primary lg:w-[7%]">Send</button>
                </div>
            </div>
            <div className={`toast ${toastVisible ? 'block' : 'hidden'}`}>
                <div className="alert alert-error text-white font-semibold">
                    <span>{toastMessage}</span>
                </div>
            </div>
        </div>
    )
}
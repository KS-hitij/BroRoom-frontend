import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User{
    roomId: string,
    name: string,
    avatar: string
}
const initialState:User= {roomId:"",name:"",avatar:""};

const userSlice = createSlice({
    initialState,
    name:"user",
    reducers:{
        setUser(state,action:PayloadAction<User>){
            state.avatar = action.payload.avatar;
            state.name = action.payload.name;
            state.roomId = action.payload.roomId;
        },
        clearUser(state){
            state.avatar = initialState.avatar;
            state.name = initialState.name;
            state.roomId = initialState.roomId;
        }
    }
});
export const {setUser,clearUser} = userSlice.actions;
export default userSlice.reducer;
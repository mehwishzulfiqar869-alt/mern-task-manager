import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export const fetchTasks = createAsyncThunk(
    "tasks/fetchTasks ", 
    async(_, ThunkAPI)=>{
        try{
            const response = await API.get("/tasks");
            return response.data.tasks || [];
        }catch(err){
            return ThunkAPI.rejectWithValue(
                err.reponse?.data?.message || "Fauiled to fetch task"
            );
        }
    }
);


export const addTask = createAsyncThunk(
    "tasks/addTask" , 
     async(taskData , ThunkAPI)=>{
    try{
        const response  = await API.post("/tasks" , taskData);
        return response.data.tasks
    }catch(err){
         return ThunkAPI.rejectwithValue(
            err.response?.data?.message || "Failed to add task"
         );
    }
    }
);


export const updateTask = createAsyncThunk(
    "tasks/updatetask" , 
   async({taskId , taskData} , ThunkAPI)=> {
    try{
        const response = await API.patch(`/task/${taskId}` ,taskData );
        return response.data.tasks
    }catch(err){
        return ThunkAPI.rejectWithValue(
            err.response?.data?.message || "Failed to update task"
        );
    }
   }
);

export const deleteTask = createAsyncThunk(
    "tasks/deleteTask" , 
    async(taskId, ThunkAPI)=>{
        try{
             await API.deleteTask(`/tasks${taskId}` , deleteTask)
            return taskId;
        }catch(err){
            return ThunkAPI.rejectWithValue(
                err.response?.data?.message || "failed to delete task"
            );
        }
    }

);

const initialState = {
    tasks: [],
    loading: true,
    error:"",
    actionError:""
};

const taskSlice = createSlice({
    name:"tasks",
    initialState,

    reducers:{
        clearActionError:(state)=>{
            state.actionError = "";
        },

        clearFetchError:(state)=>{
            state.error = "";
        },

    },


    extraReducers:(builder)=>{
        builder



        .addCase(fetchTasks.pending , (state)=>{
            state.loading=true,
            state.error = "";
        })
        .addCase(fetchTasks.fulfilled , (state , action)=>{
            state.loading = false,
            state.tasks = action.payload,
            state.error ="";
        })

        .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch tasks";
      })


      .addCase(addTask.pending, (state) => {
        state.actionError = "";
      })

      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.actionError = "";
      })

      .addCase(addTask.rejected, (state, action) => {
        state.actionError = action.payload || "Failed to add task";
      })

      .addCase(updateTask.pending, (state) => {
        state.actionError = "";
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;

        const index = state.tasks.findIndex(
          (task) => task._id === updatedTask._id
        );

        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }

        state.actionError = "";
      })

      .addCase(updateTask.rejected, (state, action) => {
        state.actionError = action.payload || "Failed to update task";
      })

        
      .addCase(deleteTask.pending, (state) => {
        state.actionError = "";
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          (task) => task._id !== action.payload
        );

        state.actionError = "";
      })

      .addCase(deleteTask.rejected, (state, action) => {
        state.actionError = action.payload || "Failed to delete task";
      });
  },
});


export const { clearActionError, clearFetchError } = taskSlice.actions;
export default taskSlice.reducer;
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Home, Plus, Menu, Calendar, Clock, ChevronDown } from "lucide-react";

// Firebase imports
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../app/firebase/config";

export default function TaskManager() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [currentView, setCurrentView] = useState("home"); // 'home' or 'addTask'
  const [tasks, setTasks] = useState([]); // เปลี่ยนเป็น state แทน hardcode
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    detail: "",
    date: "02/07/2025",
    time: "10:30:00",
    repeat: "Daily",
  });

  // const tasks = [
  //   {
  //     id: 1,
  //     name: "Task1",
  //     date: "12/07/25",
  //     time: "12:00 PM",
  //     status: "Upcoming",
  //     autoRepeat: "10 min",
  //     color: "blue",
  //   },
  //   {
  //     id: 2,
  //     name: "Task2",
  //     date: "12/07/25",
  //     time: "12:00 PM",
  //     status: "Completed",
  //     autoRepeat: "10 min",
  //     color: "green",
  //   },
  //   {
  //     id: 3,
  //     name: "Task3",
  //     date: "12/07/25",
  //     time: "12:00 PM",
  //     status: "Overdue",
  //     autoRepeat: "10 min",
  //     color: "red",
  //   },
  // ];

  const tabs = ["All", "Upcoming", "Completed", "Overdue"];

  // ฟังก์ชันดึงข้อมูล tasks จาก Firestore
  const fetchTasks = async () => {
    
    try {
      setLoading(true);
  
      const querySnapshot = await getDocs(
        collection(db, "tasks"),
        //  where("userId", "==", session.lineUserId)
      );
      const tasksData = [];

      querySnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("Set Tasks:", tasksData, session);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener สำหรับ tasks
  const setupTasksListener = () => {
    if (!session?.lineUserId) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", session.lineUserId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  };
  useEffect(() => {
    if (session?.lineUserId) {
      const unsubscribe = setupTasksListener();
      return () => unsubscribe && unsubscribe(); // cleanup
    }
  }, [session]);

    useEffect(() => {
    if (session?.lineUserId) {
      fetchTasks();
    }
  }, [session?.lineUserId]);

  const getFilteredTasks = () => {
    if (activeTab === "All") return tasks;
    return tasks.filter((task) => task.status === activeTab);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTaskBorderColor = (color) => {
    switch (color) {
      case "blue":
        return "border-l-blue-500 bg-white";
      case "green":
        return "border-l-green-500 bg-white";
      case "red":
        return "border-l-red-500 bg-white";
      default:
        return "border-l-gray-500 bg-white";
    }
  };

  const handleAddTask = () => {
    // Handle adding task logic here
    console.log("Adding task:", newTask);
    setCurrentView("home");
  };

  const handleCancel = () => {
    setCurrentView("home");
    setNewTask({
      title: "",
      detail: "",
      date: "02/07/2025",
      time: "10:30:00",
      repeat: "Daily",
    });
  };

  // Add New Task View
  if (currentView === "addTask") {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Task</h1>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              placeholder="แจ้งเตือนส่งงาน"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Detail
            </label>
            <textarea
              value={newTask.detail}
              onChange={(e) =>
                setNewTask({ ...newTask, detail: e.target.value })
              }
              placeholder="ส่ง Figma Version 1 ให้ บริษัท A"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={newTask.date}
                onChange={(e) =>
                  setNewTask({ ...newTask, date: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Time
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newTask.time}
                onChange={(e) =>
                  setNewTask({ ...newTask, time: e.target.value })
                }
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600 font-medium">am</span>
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Repeat
            </label>
            <div className="relative">
              <select
                value={newTask.repeat}
                onChange={(e) =>
                  setNewTask({ ...newTask, repeat: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Never">Never</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleAddTask}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
         <div
            className="fixed bottom-0 left-0 right-0 bg-white border-gray-200 m-4"
            style={{ borderRadius: "200px" }}
          >
            <div className="flex justify-center items-center py-2">
              <div className="flex items-center space-x-8">
                <button
                  
                  style={{ padding: "20px 40px", borderRadius: "200px" }}
                  onClick={()=>setCurrentView("home")}
                >
                  <Home className="w-6 h-6 text-white" />
                </button>

                <button
                  className="bg-blue-500 p-4"
                  onClick={() => setCurrentView("addTask")}
                >
                  <Plus className="w-6 h-6 text-blue-600" />
                </button>

                <button className="p-3">
                  <Menu className="w-10 h-10 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

        {/* Bottom padding */}
        <div className="h-24"></div>
      </div>
    );
  }

  return (
    // <div style={{ padding: 20, background: '#F0F5FB', height: '100vh' }}>
    //   <h1>Hello, P</h1>
    //   {/* <h1>LINE Login (App Router)</h1>
    //   {session ? (
    //     <>
    //       <p>👋 สวัสดี {session.user.name}</p>
    //       <img src={session.picture} width={100} />
    //       <p>🔑 LINE ID: {session.lineUserId}</p>
    //       <button onClick={() => signOut()}>ออกจากระบบ</button>
    //     </>
    //   ) : (
    //     <button onClick={() => signIn("line")}>Login with LINE</button>
    //   )} */}
    // </div>

    <div className="min-h-screen" style={{ background: "#F0F5FB" }}>
      {session ? (
        <>
          {/* Header */}
          <div className="px-6 pt-8 pb-3 flex">
            <div>
              <img
                src={session.picture}
                width={60}
                style={{ borderRadius: "50%" }}
                alt="Profile"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Hello, {session.user.name}
                {/* <p>🔑 LINE ID: {session.lineUserId}</p> */}
              </h1>
              <p className="text-gray-600">Here all your task!</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="px-6 py-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Loading tasks...</p>
              </div>
            ) : getFilteredTasks().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              getFilteredTasks().map((task) => (
                <div
                  key={task.id}
                  className={`border-l-4 ${getTaskBorderColor(
                    task.color
                  )} rounded-r-lg p-4`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2" style={{fontSize: '20px'}}>
                        {task.title}
                      </h3>
                      {task.detail && (
                        <p className="text-gray-600 text-sm mb-2">
                          {task.detail}
                        </p>
                      )}
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {task.date.toDate().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Repeat: {task.repeat}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                      {/* Action buttons */}
                      {/* <div className="flex space-x-1">
                        {task.status !== "Completed" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(task.id, "Completed")
                            }
                            className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded"
                        >
                          Delete
                        </button>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Navigation */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-white border-gray-200 m-4"
            style={{ borderRadius: "200px" }}
          >
            <div className="flex justify-center items-center py-2">
              <div className="flex items-center space-x-8">
                <button
                  className="bg-blue-500 p-4"
                  style={{ padding: "20px 40px", borderRadius: "200px" }}
                  onClick={()=>setCurrentView("home")}
                >
                  <Home className="w-6 h-6 text-white" />
                </button>

                <button
                  className="bg-blue-100 p-3 rounded-xl"
                  onClick={() => setCurrentView("addTask")}
                >
                  <Plus className="w-6 h-6 text-blue-600" />
                </button>

                <button className="p-3">
                  <Menu className="w-10 h-10 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-24"></div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <button
            style={{ cursor: 'pointer'}}
            onClick={() => signIn("line")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            Login with LINE
          </button>
        </div>
      )}
    </div>
  );
}

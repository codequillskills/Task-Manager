'use client';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchTasks();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please enter both username and password', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          fontWeight: '500',
        },
      });
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        toast.success('Successfully logged in!', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
          },
        });
        fetchTasks();
      } else {
        const errorMessage = data.error || 'Invalid credentials';
        toast.error(errorMessage, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#ef4444',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
          },
          icon: '🚫',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          fontWeight: '500',
        },
        icon: '⚠️',
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error('Task cannot be empty!', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newTask.trim() }),
      });

      if (response.ok) {
        const addedTask = await response.json();
        setTasks(currentTasks => [...currentTasks, addedTask]);
        setNewTask('');
        toast.success('Task added successfully!', {
          duration: 2000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Failed to add task', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
        toast.success('Task deleted successfully!', {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#10b981',
            color: 'white',
            borderRadius: '12px',
          },
        });
      } else {
        toast.error('Failed to delete task', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Error deleting task', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task =>
          task._id === taskId ? updatedTask : task
        ));
        setEditingTask(null);
        toast.success('Task updated successfully!', {
          duration: 2000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Failed to update task', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const toggleComplete = async (taskId, completed) => {
    try {
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, completed: !completed } : task
      ));

      await updateTask(taskId, { completed: !completed });
    } catch (error) {
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, completed: completed } : task
      ));
      toast.error('Failed to update task status', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setTasks([]);
  };

  const filterTasks = (tasksToFilter) => {
    return tasksToFilter
      .filter(task => {
        if (filterStatus === 'completed') return task.completed;
        if (filterStatus === 'active') return !task.completed;
        return true;
      })
      .filter(task => {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
      });
  };

  const sortAndFilterTasks = (tasksToSort) => {
    const filteredTasks = filterTasks(tasksToSort);
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'completed':
          return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-gray-800">Task Manager</h1>
                <p className="text-gray-500">Welcome back! Please login to continue.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none text-gray-700 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none text-gray-700 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="h-full max-w-6xl mx-auto p-6 flex flex-col">
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Task Manager
            </h1>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              Logout
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-6 mb-6">
              <form onSubmit={addTask} className="flex gap-4">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center gap-2"
                >
                  <span>Add Task</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </form>

              <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Search Tasks</label>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                    >
                      <option value="all">All Tasks</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="title">Title</option>
                      <option value="completed">Completion Status</option>
                    </select>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm space-y-2">
                    <h3 className="text-sm font-medium text-gray-600">Task Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <p className="text-2xl font-bold text-purple-600">{tasks.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-pink-600">
                          {tasks.filter(task => task.completed).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ul className="h-full overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {sortAndFilterTasks(tasks).map((task) => (
                  <li
                    key={task._id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6 flex items-center justify-between gap-4">
                      {editingTask === task._id ? (
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            const updatedTasks = tasks.map(t =>
                              t._id === task._id ? { ...t, title: e.target.value } : t
                            );
                            setTasks(updatedTasks);
                          }}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center flex-1 gap-4">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task._id, task.completed)}
                            className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-200"
                          />
                          <span className={`text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.title}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-3">
                        {editingTask === task._id ? (
                          <>
                            <button
                              onClick={() => updateTask(task._id, { title: task.title })}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTask(null)}
                              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingTask(task._id)}
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

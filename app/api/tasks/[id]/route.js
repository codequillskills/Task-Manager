import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Task from '@/app/models/Task';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await request.json();
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
} 
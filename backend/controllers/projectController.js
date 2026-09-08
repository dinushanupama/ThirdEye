const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project/category
// @route   POST /api/projects
// @access  Private (Manager/Admin)
const createProject = async (req, res) => {
  try {
    const { name, description, assignedUsers } = req.body;

    const projectExists = await Project.findOne({ name });
    if (projectExists) {
      return res.status(400).json({ message: 'Project already exists' });
    }

    const project = await Project.create({
      name,
      description,
      assignedUsers
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (Managers see all, Team Members see their assigned ones)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // If the user is a team member, ONLY fetch projects where their ID is in the assignedUsers array
    const filter = req.user.role === 'team_member' 
      ? { status: 'active', assignedUsers: req.user._id } 
      : {};
    
    const projects = await Project.find(filter).populate('assignedUsers', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all team members (for the project assignment dropdown)
// @route   GET /api/projects/users
// @access  Private (Manager/Admin)
const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({ role: 'team_member' }).select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Manager/Admin)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Manager/Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getTeamMembers
};
const Project = require('../models/Project');

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

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (All authenticated users)
const getProjects = async (req, res) => {
  try {
    // Only fetch active projects for team members, managers see all
    const filter = req.user.role === 'team_member' ? { status: 'active' } : {};
    
    const projects = await Project.find(filter).populate('assignedUsers', 'name email');
    res.json(projects);
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
  deleteProject
};
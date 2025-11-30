const postService = require('../services/post.service');

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();
    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const postData = req.body;
    const post = await postService.createPost(postData);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    const post = await postService.updatePost(id, postData);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await postService.deletePost(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};


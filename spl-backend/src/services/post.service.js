const prisma = require('../prisma/prismaClient');

const getAllPosts = async () => {
  return await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

const createPost = async (postData) => {
  return await prisma.post.create({
    data: postData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

const updatePost = async (id, postData) => {
  return await prisma.post.update({
    where: { id },
    data: postData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id }
  });
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};


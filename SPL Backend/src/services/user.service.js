const prisma = require('../prisma/prismaClient');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData
  });
};

const updateUser = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: userData
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};


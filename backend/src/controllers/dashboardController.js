function getDashboardData(req, res) {
  return res.status(200).json({
    message: "Protected dashboard data fetched successfully.",
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });
}

export { getDashboardData };

import Visitor from "../models/Visitor.js";

export const createVisitor = async (req, res) => {
  try {
    const { name, mobile, company, personToMeet, purpose } = req.body;

    if (!name || !mobile || !company || !personToMeet || !purpose) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const visitor = await Visitor.create({
      name,
      mobile,
      company,
      personToMeet,
      purpose
    });

    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayVisitors = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const visitors = await Visitor.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });

    const headers = [
      "Name",
      "Mobile",
      "Company/College",
      "Person To Meet",
      "Purpose",
      "Date & Time"
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = visitors.map((visitor) => [
      visitor.name,
      visitor.mobile,
      visitor.company,
      visitor.personToMeet,
      visitor.purpose,
      new Date(visitor.createdAt).toLocaleString()
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=visitor-list.csv"
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

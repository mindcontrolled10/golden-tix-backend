const validate = {
  body: (...allowedBody) => {
    return (req, res, next) => {
      const { body } = req;
      const sanitizedBody = Object.keys(body).filter((e) =>
        allowedBody.includes(e)
      );

      const newBody = {};
      for (let key of sanitizedBody) {
        if (!body[key]) return res.status(400).json({ msg: `${key} is empty` });
        Object.assign(newBody, { [key]: body[key] });
      }
      if (Object.keys(newBody).length === 0)
        return res.status(400).json({ msg: "Nothing inserted" });
      if (Object.keys(newBody).length !== allowedBody.length)
        return res.status(400).json({ msg: "Body doesnt meet required input" });
      req.body = newBody;
      next();
    };
  },
  query: (...allowedBody) => {
    return (req, res, next) => {
      const { query } = req;
      const sanitizedQuery = Object.keys(query).filter((e) =>
        allowedBody.includes(e)
      );

      const newQuery = {};
      for (let key of sanitizedQuery) {
        Object.assign(newQuery, { [key]: query[key] });
      }

      req.query = newQuery;
      next();
    };
  },
  chekUpload: () => {
    return (req, res, next) => {
      const { file } = req;
      if (!file)
        return res.status(400).json({ msg: "You must Upload an Image" });
      next();
    };
  },
  patchBody: (...allowedBody) => {
    return (req, res, next) => {
      const { body } = req;
      const sanitizedBody = Object.keys(body).filter((e) =>
        allowedBody.includes(e)
      );

      const newBody = {};
      for (let key of sanitizedBody) {
        if (!body[key]) return res.status(400).json({ msg: `${key} is empty` });
        Object.assign(newBody, { [key]: body[key] });
      }
      next();
    };
  },
};

module.exports = validate;

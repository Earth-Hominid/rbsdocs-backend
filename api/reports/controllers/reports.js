"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create report with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.owner = ctx.state.user.id;
      entity = await strapi.services.reports.create(data, { files });
    } else {
      ctx.request.body.owner = ctx.state.user.id;
      entity = await strapi.services.reports.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.reports });
  },

  // Update user report
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [reports] = await strapi.services.reports.find({
      id: ctx.params.id,
      "owner.id": ctx.state.user.id,
    });

    if (!reports) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.reports.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.reports.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.reports });
  },

  // Delete a user report
  async delete(ctx) {
    const { id } = ctx.params;

    const [reports] = await strapi.services.reports.find({
      id: ctx.params.id,
      "owner.id": ctx.state.user.id,
    });

    if (!reports) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.reports.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.reports });
  },

  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.reports.find({ owner: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.reports });
  },
};

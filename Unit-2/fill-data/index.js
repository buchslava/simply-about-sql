const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "meetup-test",
  },
});

(async () => {
  try {
    await knex.transaction(async (trx) => {
      try {
        for (let i = 1; i < 1000000; i++) {
          await trx
            .insert({
              person: `IT Person ${i}`,
              dep: "IT",
              salary: getRandom(10, 500),
            })
            .into("staff");
          await trx
            .insert({
              person: `Service Person ${i}`,
              dep: "Service",
              salary: getRandom(10, 500),
            })
            .into("staff_copy");
        }
        await trx.commit();
      } catch (e) {
        console.log(e);
        await trx.rollback();
        process.exit(-1);
      }
    });
  } catch (e) {
    console.log(e);
    process.exit(-1);
  } finally {
    process.exit(0);
  }
})();

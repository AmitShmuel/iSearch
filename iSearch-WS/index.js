/**
 * @project WS for POPZIT
 * @author Yoav Saroya & Amit Shmuel
 * @licence Shenkar college
 */

require('./database');
const app = require('./server'),
      port = process.env.PORT || 3000;

app.listen(port, () => {console.log(`Listening on port ${port}`)});
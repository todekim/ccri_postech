const connection = require('./config/dbConfig')
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passportConfig = require('./config/passport')
const passport = require('passport')
const excel = require("excel4node")
const session = require("express-session")
const flash = require('connect-flash')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.set('port', 3005)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
      resave: false,
      saveUninitialized: false,
      secret: "postech",
      cookie: {
          httpOnly: true,
          secure: false
      }
  })
)

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
passportConfig(passport)

const isAuthenticated = () => (req, res, next) => {
  if (!req.user) {
      return res.redirect("/login")
  }
  next()
}

app.get("/", (req, res) => {

  res.render('index')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
      return req.login(user, loginError => {
          if (loginError) {
              console.error(loginError);
          }
      });
  })(req, res, next);
  res.redirect("/admin");
});

app.get("/logout", (req, res) => {
    req.logOut()
    req.session.destroy(() => {
        req.session
    })
    res.redirect("/login")
})

app.get('/admin', isAuthenticated(), async (req, res) => {

    let pageNoo = req.query.page
    let pageNo
    if (pageNoo == undefined) {
        pageNo = 1
    } else {
        pageNo = pageNoo
    }
    let startNo = (Number(pageNo) - 1) * 10 + 1
    let endNo = Number(pageNo) * 10

    let sql = "SELECT  rnum, name, tel as phone, msg  " +
        "FROM (" +
        "         SELECT @rownum := @rownum + 1 rnum," +
        "                c.*" +
        "         FROM client c," +
        "              (SELECT @ROWNUM := 0) R" +
        "         WHERE 1 = 1" +
        "     ) list " +
        "WHERE rnum >= " +
        startNo +
        "  AND rnum <= " +
        endNo

    let sql2 = "select count(*) from client"

    let rst = await (await connection).execute(sql)
    let rst2 = await (await connection).execute(sql2)


    let total = rst2[0][0]['count(*)']
    let totalPage = (Math.ceil(Number(total) / 10))
    let totalStart = (Math.ceil(Number(pageNo) / 10) - 1) * 10 + 1
    let totalEnd = (totalStart + 9 > totalPage) ? totalPage : totalStart + 9

    let prevExist = (totalStart - 10 > 0) ? true : false
    let nextExist = (totalStart + 9 < totalPage) ? true : false

    res.render("admin", {rst: rst[0], start: totalStart, end: totalEnd, next: nextExist, prev: prevExist})
  
})

app.post('/insertData', async(req, res) => {
  let name = req.body.name;
  // let phone = req.body.phone
  let email = req.body.email
  // let tel = phone.join("-")
  let message = req.body.message

  let sql = "select count(*) from client where name = '" + name + "' and tel = '" + email + "'"
  let rst = await (await connection).execute(sql)
  if(rst[0][0]['count(*)'] < 1){
    let sql2 = "insert into client(name, tel, msg) values (" +
      "'" + name + "', " +
      "'" + email + "', " +
      "'" + message + "')"
    let rst2 = await (await connection).execute(sql2)
    console.log("rst2 : ", rst2);
    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
    res.write("<script type=\"text/javascript\" charset='UTF-8'>alert('접수 완료되었습니다.')</script>");
    //res.write("<script type=\"text/javascript\" charset='UTF-8'>alert('응원 완료되었습니다..')</script>");
    res.write("<script>location.href = document.referrer</script>");
    res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
    res.write("<script type=\"text/javascript\" charset='UTF-8'>alert('이미 정답을 작성하셨습니다.')</script>");
    //res.write("<script type=\"text/javascript\" charset='UTF-8'>alert('이미 응원을 작성하셨습니다.')</script>");
    res.write("<script>location.href = document.referrer</script>");
    res.end();
  }
})

app.get('/excelDown', isAuthenticated(), async(req, res) => {
  var wb = new excel.Workbook();
  var ws = wb.addWorksheet("sheet1")
  var query = "SELECT * " +
      "FROM (" +
      "         SELECT @rownum := @rownum + 1 rnum," +
      "                c.*" +
      "         FROM client c," +
      "              (SELECT @ROWNUM := 0) R" +
      "         WHERE 1 = 1" +
      "     ) list "

  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth() + 1
  var currentDate = currentDate.getDate();

  var today = currentYear + "_" + currentMonth + "_" + currentDate

  let rstt = await (await connection).execute(query)
  let rst = rstt[0]

  ws.column(1).setWidth(5)
  ws.column(2).setWidth(15)
  ws.column(3).setWidth(15)
  ws.column(4).setWidth(70)

  ws.cell(1, 1).string('');
  ws.cell(1, 2).string('이름');
  // ws.cell(1, 3).string('연락처');
  ws.cell(1, 3).string('이메일');
  ws.cell(1, 4).string('정답');

  for (let i = 1; i < rst.length+1; i++) {
    ws.cell(i+1,1).string((i).toString())
    ws.cell(i+1,2).string(rst[i-1].name)
    ws.cell(i+1,3).string(rst[i-1].tel)
    ws.cell(i+1,4).string(rst[i-1].msg)
  }
  wb.write(today + "_정답 작성 목록.xlsx", res);
  //wb.write(today + "_메시지 작성 목록.xlsx", res);
})

app.listen(app.get('port'), ()=>{
  console.log(app.get('port') + ' port is running');
})

module.exports = app;

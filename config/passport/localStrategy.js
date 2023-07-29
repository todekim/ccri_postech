const localStrategy = require("passport-local").Strategy

module.exports = passport =>{
    passport.use(
        new localStrategy(
            {
                usernameField : "id",
                passwordField : "password"
            },
            (id, pw, done) => {
                const user = {
                    id : "admin",
                    password : "admin1@34"
                }
                if(id === user.id && pw === user.password){
                    done(null, user)
                }
            }
        )
    )
}
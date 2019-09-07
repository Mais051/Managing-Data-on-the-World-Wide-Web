import axios from 'axios'

export const register = newUser => {
  return axios
    .post('http://127.0.0.1:5000/user/new', {
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      gender: newUser.gender,
      birth_date: newUser.birth_date,
      email: newUser.email,
      password: newUser.password
    })
    .then(response => {
        return response.data
    })
}


export const login = user => {
    axios.defaults.withCredentials = true;
  return axios
    .post('http://127.0.0.1:5000/login', {
      email: user.email,
      password: user.password
    })
    .then(response => {
      localStorage.setItem('usertoken', response.data)
      return response.data
    })
    .catch(err => {
      console.log(err)
        return 'error'
    })
}

export const getProfile = user => {
  return axios
    .get('users/profile', {
      //headers: { Authorization: ` ${this.getToken()}` }
    })
    .then(response => {
      console.log(response)
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}
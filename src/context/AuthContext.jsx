import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  // ✅ VERSIÓN SIMPLIFICADA Y ROBUSTA DE checkAuth
  const checkAuth = () => {
    try {
      console.log('🔐 checkAuth - Buscando credenciales...')
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      console.log('📦 Encontrado:', {
        token: token ? `✅ (${token.substring(0, 10)}...)` : '❌ No hay token',
        user: savedUser ? '✅ Hay usuario' : '❌ No hay usuario'
      })

      if (token && savedUser) {
        console.log('⚙️ Configurando autenticación...')
        api.defaults.headers.Authorization = `Bearer ${token}`
        
        try {
          const userData = JSON.parse(savedUser)
          console.log('👤 Usuario establecido:', userData)
          setUser(userData)
        } catch (error) {
          console.error('❌ Error parseando usuario:', error)
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        console.log('📭 No hay credenciales válidas')
        setUser(null)
      }
    } catch (error) {
      console.error('💥 Error en checkAuth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ VERSIÓN MEJORADA DE LOGIN
  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('🚀 Iniciando login...')

      const emailStr = String(email).trim()
      const passwordStr = String(password)

      if (!emailStr || !passwordStr) {
        toast.error('Email y contraseña son requeridos')
        return
      }

      const loginData = { email: emailStr, password: passwordStr }
      console.log('📤 Enviando:', loginData)

      const response = await api.post('/auth/login', loginData)
      console.log('📥 Respuesta recibida:', response.data)

      const responseData = response.data

      // ✅ EXTRACCIÓN ROBUSTA DE TOKEN Y USUARIO
      const token = responseData.token || responseData.access_token
      let userData = responseData.user || responseData.data

      if (!token) {
        throw new Error('No se recibió token del servidor')
      }

      // ✅ SI NO VIENE USUARIO, CREARLO
      if (!userData) {
        userData = {
          email: emailStr,
          name: emailStr.split('@')[0],
          id: Date.now()
        }
        console.log('👤 Usuario creado:', userData)
      }

      // ✅ GUARDAR EN LOCALSTORAGE (ESTE ES EL PASO CLAVE)
      console.log('💾 Guardando en localStorage...')
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      // ✅ VERIFICAR QUE SE GUARDÓ
      console.log('✅ Verificando guardado:', {
        tokenGuardado: localStorage.getItem('token') ? '✅' : '❌',
        userGuardado: localStorage.getItem('user') ? '✅' : '❌'
      })

      // ✅ CONFIGURAR HEADERS
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(userData)

      // ✅ REDIRIGIR
      console.log('📍 Redirigiendo a /projects')
      navigate('/projects')

      toast.success(`Bienvenido ${userData.name || userData.email}`)

    } catch (error) {
      console.error('❌ Error en login:', error)
      
      let errorMessage = 'Error al iniciar sesión'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', userData)
      
      const token = response.data.token
      const user = response.data.user
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(user)
      navigate('/projects')
      
      toast.success(`Cuenta creada. Bienvenido ${user.name || user.email}`)
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error(error.response?.data?.message || 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.Authorization
    setUser(null)
    navigate('/login')
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
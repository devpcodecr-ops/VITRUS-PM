const jwt = require('jsonwebtoken');

// Middleware para proteger rutas y extraer contexto del usuario
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // CRÍTICO: Vincular contexto del usuario y su tenant a la request
      req.user = {
        id: decoded.userId,
        studioId: decoded.studioId, // ID del Tenant
        role: decoded.role,
        email: decoded.email
      };

      // Control de seguridad adicional
      if (!req.user.studioId && req.user.role !== 'admin_global') {
         // Si no es admin global, DEBE tener un studioId
         console.error(`Security Warning: User ${req.user.id} has no studioId`);
         return res.status(401).json({ message: 'Not authorized: Tenant context missing' });
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware para autorizar roles específicos
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Role ${req.user.role} is not authorized to access this resource`
            });
        }
        next();
    };
};

// Middleware para validar acceso a recursos de un tenant específico
// Útil cuando se pasa :studioId en la URL
const validateStudioAccess = (req, res, next) => {
    // Admin Global tiene acceso universal
    if (req.user.role === 'admin_global') {
        return next();
    }
    
    // Para rutas con parámetro :studioId
    if (req.params.studioId) {
        const requestedStudioId = parseInt(req.params.studioId);
        if (req.user.studioId !== requestedStudioId) {
            console.warn(`Access Denied: User ${req.user.id} (Studio ${req.user.studioId}) tried to access Studio ${requestedStudioId}`);
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }
    }

    // Para cuerpos de solicitud (Body)
    if (req.body.studio_id) {
        // Forzar que el studio_id del body coincida con el del token
        // Esto evita que un usuario inyecte datos en otro tenant
        req.body.studio_id = req.user.studioId; 
    }

    next();
};

module.exports = { protect, authorize, validateStudioAccess };

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      arp_asignaciones: {
        Row: {
          activo: boolean
          creado_en: string
          id: string
          rol_app: string
          ubicacion_id: string | null
          usuario_id: string
        }
        Insert: {
          activo?: boolean
          creado_en?: string
          id?: string
          rol_app: string
          ubicacion_id?: string | null
          usuario_id: string
        }
        Update: {
          activo?: boolean
          creado_en?: string
          id?: string
          rol_app?: string
          ubicacion_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arp_asignaciones_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_asignaciones_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_asignaciones_usuario_fk"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      arp_clientes: {
        Row: {
          activo: boolean
          ciudad: string | null
          creado_en: string
          id: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          ciudad?: string | null
          creado_en?: string
          id?: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          ciudad?: string | null
          creado_en?: string
          id?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      arp_envios: {
        Row: {
          actualizado_en: string
          archivado: boolean
          cantidad_arpillas: number
          cantidad_recibida: number | null
          creado_en: string
          creado_por: string | null
          destino_id: string
          estado: string
          evidencia_recepcion_url: string | null
          evidencia_url: string | null
          fecha_envio: string
          fecha_recepcion: string | null
          folio: string
          id: string
          notas: string | null
          notas_recepcion: string | null
          origen_id: string
          recibido_por: string | null
          version: number
        }
        Insert: {
          actualizado_en?: string
          archivado?: boolean
          cantidad_arpillas: number
          cantidad_recibida?: number | null
          creado_en?: string
          creado_por?: string | null
          destino_id: string
          estado?: string
          evidencia_recepcion_url?: string | null
          evidencia_url?: string | null
          fecha_envio?: string
          fecha_recepcion?: string | null
          folio?: string
          id?: string
          notas?: string | null
          notas_recepcion?: string | null
          origen_id: string
          recibido_por?: string | null
          version?: number
        }
        Update: {
          actualizado_en?: string
          archivado?: boolean
          cantidad_arpillas?: number
          cantidad_recibida?: number | null
          creado_en?: string
          creado_por?: string | null
          destino_id?: string
          estado?: string
          evidencia_recepcion_url?: string | null
          evidencia_url?: string | null
          fecha_envio?: string
          fecha_recepcion?: string | null
          folio?: string
          id?: string
          notas?: string | null
          notas_recepcion?: string | null
          origen_id?: string
          recibido_por?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "arp_envios_creado_por_fk"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_envios_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_origen_id_fkey"
            columns: ["origen_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_envios_origen_id_fkey"
            columns: ["origen_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_recibido_por_fk"
            columns: ["recibido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      arp_movimientos_inventario: {
        Row: {
          cantidad: number
          creado_en: string
          creado_por: string | null
          id: string
          motivo: string | null
          referencia_id: string | null
          referencia_tabla: string | null
          tipo: string
          ubicacion_id: string
        }
        Insert: {
          cantidad: number
          creado_en?: string
          creado_por?: string | null
          id?: string
          motivo?: string | null
          referencia_id?: string | null
          referencia_tabla?: string | null
          tipo: string
          ubicacion_id: string
        }
        Update: {
          cantidad?: number
          creado_en?: string
          creado_por?: string | null
          id?: string
          motivo?: string | null
          referencia_id?: string | null
          referencia_tabla?: string | null
          tipo?: string
          ubicacion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arp_movimientos_creado_por_fk"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_movimientos_inventario_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_movimientos_inventario_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      arp_ubicaciones: {
        Row: {
          activo: boolean
          ciudad: string | null
          creado_en: string
          es_destino: boolean
          es_origen: boolean
          id: string
          nombre: string
          pin_hmac: string | null
        }
        Insert: {
          activo?: boolean
          ciudad?: string | null
          creado_en?: string
          es_destino?: boolean
          es_origen?: boolean
          id?: string
          nombre: string
          pin_hmac?: string | null
        }
        Update: {
          activo?: boolean
          ciudad?: string | null
          creado_en?: string
          es_destino?: boolean
          es_origen?: boolean
          id?: string
          nombre?: string
          pin_hmac?: string | null
        }
        Relationships: []
      }
      arp_ventas: {
        Row: {
          cancelada: boolean
          cantidad_arpillas: number
          cliente_id: string
          creado_en: string
          fecha_venta: string
          folio: string
          id: string
          motivo_cancelacion: string | null
          notas: string | null
          precio_unitario: number | null
          registrado_por: string | null
          ubicacion_id: string
        }
        Insert: {
          cancelada?: boolean
          cantidad_arpillas: number
          cliente_id: string
          creado_en?: string
          fecha_venta?: string
          folio?: string
          id?: string
          motivo_cancelacion?: string | null
          notas?: string | null
          precio_unitario?: number | null
          registrado_por?: string | null
          ubicacion_id: string
        }
        Update: {
          cancelada?: boolean
          cantidad_arpillas?: number
          cliente_id?: string
          creado_en?: string
          fecha_venta?: string
          folio?: string
          id?: string
          motivo_cancelacion?: string | null
          notas?: string | null
          precio_unitario?: number | null
          registrado_por?: string | null
          ubicacion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arp_ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "arp_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_ventas_registrado_por_fk"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_ventas_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_ventas_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      conceptos_gasto: {
        Row: {
          activo: boolean
          categoria: Database["public"]["Enums"]["categoria_gasto"]
          creado_en: string
          id: string
          nombre: string
          nombre_busqueda: string | null
          orden_visual: number
          unidad_default: string | null
        }
        Insert: {
          activo?: boolean
          categoria: Database["public"]["Enums"]["categoria_gasto"]
          creado_en?: string
          id?: string
          nombre: string
          nombre_busqueda?: string | null
          orden_visual?: number
          unidad_default?: string | null
        }
        Update: {
          activo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_gasto"]
          creado_en?: string
          id?: string
          nombre?: string
          nombre_busqueda?: string | null
          orden_visual?: number
          unidad_default?: string | null
        }
        Relationships: []
      }
      contadores_folio: {
        Row: {
          fecha: string
          ultimo: number
        }
        Insert: {
          fecha: string
          ultimo?: number
        }
        Update: {
          fecha?: string
          ultimo?: number
        }
        Relationships: []
      }
      establecimientos: {
        Row: {
          activo: boolean
          actualizado_en: string
          ciudad: string | null
          creado_en: string
          direccion: string | null
          hora_apertura_default: string | null
          id: string
          nombre: string
          nombre_busqueda: string | null
          notas_internas: string | null
          telefono: string | null
          verificado: boolean
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          ciudad?: string | null
          creado_en?: string
          direccion?: string | null
          hora_apertura_default?: string | null
          id?: string
          nombre: string
          nombre_busqueda?: string | null
          notas_internas?: string | null
          telefono?: string | null
          verificado?: boolean
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          ciudad?: string | null
          creado_en?: string
          direccion?: string | null
          hora_apertura_default?: string | null
          id?: string
          nombre?: string
          nombre_busqueda?: string | null
          notas_internas?: string | null
          telefono?: string | null
          verificado?: boolean
        }
        Relationships: []
      }
      gastos: {
        Row: {
          cantidad: number | null
          categoria: Database["public"]["Enums"]["categoria_gasto"]
          concepto_id: string
          concepto_nombre: string
          creado_en: string
          creado_por: string | null
          eliminado_en: string | null
          fecha: string
          id: string
          monto_centavos: number
          notas: string | null
          unidad: string | null
        }
        Insert: {
          cantidad?: number | null
          categoria: Database["public"]["Enums"]["categoria_gasto"]
          concepto_id: string
          concepto_nombre: string
          creado_en?: string
          creado_por?: string | null
          eliminado_en?: string | null
          fecha?: string
          id?: string
          monto_centavos: number
          notas?: string | null
          unidad?: string | null
        }
        Update: {
          cantidad?: number | null
          categoria?: Database["public"]["Enums"]["categoria_gasto"]
          concepto_id?: string
          concepto_nombre?: string
          creado_en?: string
          creado_por?: string | null
          eliminado_en?: string | null
          fecha?: string
          id?: string
          monto_centavos?: number
          notas?: string | null
          unidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_gasto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      intentos_acceso: {
        Row: {
          bloqueado_hasta: string | null
          intentos: number
          ip: string
          ultimo_en: string
        }
        Insert: {
          bloqueado_hasta?: string | null
          intentos?: number
          ip: string
          ultimo_en?: string
        }
        Update: {
          bloqueado_hasta?: string | null
          intentos?: number
          ip?: string
          ultimo_en?: string
        }
        Relationships: []
      }
      pedido_eventos: {
        Row: {
          creado_en: string
          estado_anterior: Database["public"]["Enums"]["estado_pedido"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_pedido"]
          id: number
          pedido_id: string
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string
          estado_anterior?: Database["public"]["Enums"]["estado_pedido"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_pedido"]
          id?: number
          pedido_id: string
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string
          estado_anterior?: Database["public"]["Enums"]["estado_pedido"] | null
          estado_nuevo?: Database["public"]["Enums"]["estado_pedido"]
          id?: number
          pedido_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_eventos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          categoria: Database["public"]["Enums"]["categoria_producto"]
          id: string
          pedido_id: string
          producto_id: string
          producto_nombre: string
          producto_presentacion: string | null
        }
        Insert: {
          cantidad: number
          categoria: Database["public"]["Enums"]["categoria_producto"]
          id?: string
          pedido_id: string
          producto_id: string
          producto_nombre: string
          producto_presentacion?: string | null
        }
        Update: {
          cantidad?: number
          categoria?: Database["public"]["Enums"]["categoria_producto"]
          id?: string
          pedido_id?: string
          producto_id?: string
          producto_nombre?: string
          producto_presentacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          actualizado_en: string
          archivado_en: string | null
          creado_en: string
          creado_por: string | null
          dispositivo: string | null
          eliminado_en: string | null
          establecimiento_id: string
          establecimiento_nombre: string
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega: string
          fecha_operacion: string
          folio: string
          hora_apertura: string
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          notas: string | null
          origen: Database["public"]["Enums"]["origen_pedido"]
          req_etiquetado: boolean
          total_botellas: number
        }
        Insert: {
          actualizado_en?: string
          archivado_en?: string | null
          creado_en?: string
          creado_por?: string | null
          dispositivo?: string | null
          eliminado_en?: string | null
          establecimiento_id: string
          establecimiento_nombre: string
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega?: string
          fecha_operacion?: string
          folio?: string
          hora_apertura: string
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          notas?: string | null
          origen?: Database["public"]["Enums"]["origen_pedido"]
          req_etiquetado?: boolean
          total_botellas?: number
        }
        Update: {
          actualizado_en?: string
          archivado_en?: string | null
          creado_en?: string
          creado_por?: string | null
          dispositivo?: string | null
          eliminado_en?: string | null
          establecimiento_id?: string
          establecimiento_nombre?: string
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega?: string
          fecha_operacion?: string
          folio?: string
          hora_apertura?: string
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          notas?: string | null
          origen?: Database["public"]["Enums"]["origen_pedido"]
          req_etiquetado?: boolean
          total_botellas?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      produccion: {
        Row: {
          cantidad: number
          categoria: Database["public"]["Enums"]["categoria_producto"]
          creado_en: string
          creado_por: string | null
          eliminado_en: string | null
          fecha: string
          id: string
          notas: string | null
          producto_id: string
          producto_nombre: string
          producto_presentacion: string | null
        }
        Insert: {
          cantidad: number
          categoria: Database["public"]["Enums"]["categoria_producto"]
          creado_en?: string
          creado_por?: string | null
          eliminado_en?: string | null
          fecha?: string
          id?: string
          notas?: string | null
          producto_id: string
          producto_nombre: string
          producto_presentacion?: string | null
        }
        Update: {
          cantidad?: number
          categoria?: Database["public"]["Enums"]["categoria_producto"]
          creado_en?: string
          creado_por?: string | null
          eliminado_en?: string | null
          fecha?: string
          id?: string
          notas?: string | null
          producto_id?: string
          producto_nombre?: string
          producto_presentacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produccion_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean
          categoria: Database["public"]["Enums"]["categoria_producto"]
          color_hex: string | null
          creado_en: string
          id: string
          nombre: string
          orden_visual: number
          presentacion: string | null
          sku: string
          unidad: string
        }
        Insert: {
          activo?: boolean
          categoria: Database["public"]["Enums"]["categoria_producto"]
          color_hex?: string | null
          creado_en?: string
          id?: string
          nombre: string
          orden_visual?: number
          presentacion?: string | null
          sku: string
          unidad?: string
        }
        Update: {
          activo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_producto"]
          color_hex?: string | null
          creado_en?: string
          id?: string
          nombre?: string
          orden_visual?: number
          presentacion?: string | null
          sku?: string
          unidad?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean
          auth_user_id: string | null
          creado_en: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          activo?: boolean
          auth_user_id?: string | null
          creado_en?: string
          id?: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          activo?: boolean
          auth_user_id?: string | null
          creado_en?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
    }
    Views: {
      arp_envios_detalle: {
        Row: {
          actualizado_en: string | null
          archivado: boolean | null
          cantidad_arpillas: number | null
          cantidad_recibida: number | null
          creado_en: string | null
          creado_por: string | null
          destino_id: string | null
          destino_nombre: string | null
          diferencia: number | null
          estado: string | null
          evidencia_recepcion_url: string | null
          evidencia_url: string | null
          fecha_envio: string | null
          fecha_recepcion: string | null
          folio: string | null
          id: string | null
          notas: string | null
          notas_recepcion: string | null
          origen_id: string | null
          origen_nombre: string | null
          recibido_por: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arp_envios_creado_por_fk"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_envios_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_origen_id_fkey"
            columns: ["origen_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_envios_origen_id_fkey"
            columns: ["origen_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_envios_recibido_por_fk"
            columns: ["recibido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      arp_inventario_actual: {
        Row: {
          ciudad: string | null
          existencia: number | null
          ubicacion: string | null
          ubicacion_id: string | null
          ultimo_movimiento: string | null
        }
        Relationships: []
      }
      arp_ventas_detalle: {
        Row: {
          cancelada: boolean | null
          cantidad_arpillas: number | null
          cliente_ciudad: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          creado_en: string | null
          fecha_venta: string | null
          folio: string | null
          id: string | null
          motivo_cancelacion: string | null
          notas: string | null
          precio_unitario: number | null
          registrado_por: string | null
          total: number | null
          ubicacion_id: string | null
          ubicacion_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arp_ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "arp_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_ventas_registrado_por_fk"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arp_ventas_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_inventario_actual"
            referencedColumns: ["ubicacion_id"]
          },
          {
            foreignKeyName: "arp_ventas_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "arp_ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      arp_ajustar_inventario: {
        Args: {
          p_cantidad: number
          p_motivo: string
          p_ubicacion_id: string
          p_usuario_id?: string
        }
        Returns: {
          cantidad: number
          creado_en: string
          creado_por: string | null
          id: string
          motivo: string | null
          referencia_id: string | null
          referencia_tabla: string | null
          tipo: string
          ubicacion_id: string
        }
        SetofOptions: {
          from: "*"
          to: "arp_movimientos_inventario"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      arp_cancelar_venta: {
        Args: { p_motivo?: string; p_usuario_id?: string; p_venta_id: string }
        Returns: {
          cancelada: boolean
          cantidad_arpillas: number
          cliente_id: string
          creado_en: string
          fecha_venta: string
          folio: string
          id: string
          motivo_cancelacion: string | null
          notas: string | null
          precio_unitario: number | null
          registrado_por: string | null
          ubicacion_id: string
        }
        SetofOptions: {
          from: "*"
          to: "arp_ventas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      arp_confirmar_recepcion: {
        Args: {
          p_cantidad_recibida: number
          p_envio_id: string
          p_evidencia_url?: string
          p_notas?: string
          p_usuario_id?: string
          p_version: number
        }
        Returns: {
          actualizado_en: string
          archivado: boolean
          cantidad_arpillas: number
          cantidad_recibida: number | null
          creado_en: string
          creado_por: string | null
          destino_id: string
          estado: string
          evidencia_recepcion_url: string | null
          evidencia_url: string | null
          fecha_envio: string
          fecha_recepcion: string | null
          folio: string
          id: string
          notas: string | null
          notas_recepcion: string | null
          origen_id: string
          recibido_por: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "arp_envios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      arp_registrar_venta: {
        Args: {
          p_cantidad: number
          p_cliente_id: string
          p_fecha?: string
          p_notas?: string
          p_precio_unitario?: number
          p_ubicacion_id: string
          p_usuario_id?: string
        }
        Returns: {
          cancelada: boolean
          cantidad_arpillas: number
          cliente_id: string
          creado_en: string
          fecha_venta: string
          folio: string
          id: string
          motivo_cancelacion: string | null
          notas: string | null
          precio_unitario: number | null
          registrado_por: string | null
          ubicacion_id: string
        }
        SetofOptions: {
          from: "*"
          to: "arp_ventas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crear_pedido: { Args: { p_pedido: Json }; Returns: Json }
      esta_bloqueado: { Args: { p_ip: string }; Returns: boolean }
      registrar_intento_fallido: { Args: { p_ip: string }; Returns: boolean }
      resumen_inventario: { Args: { p_filtros: Json }; Returns: Json }
      resumen_produccion: { Args: { p_filtros: Json }; Returns: Json }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      siguiente_folio: { Args: never; Returns: string }
    }
    Enums: {
      categoria_gasto: "materia_prima" | "insumo"
      categoria_producto: "agua" | "pulpa"
      estado_pedido:
        | "recibido"
        | "pendiente_recoleccion"
        | "en_reparto"
        | "entregado"
        | "cancelado"
      metodo_pago: "efectivo" | "transferencia" | "mixto"
      origen_pedido: "cliente" | "operador"
      rol_usuario: "admin" | "operador" | "repartidor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_gasto: ["materia_prima", "insumo"],
      categoria_producto: ["agua", "pulpa"],
      estado_pedido: [
        "recibido",
        "pendiente_recoleccion",
        "en_reparto",
        "entregado",
        "cancelado",
      ],
      metodo_pago: ["efectivo", "transferencia", "mixto"],
      origen_pedido: ["cliente", "operador"],
      rol_usuario: ["admin", "operador", "repartidor"],
    },
  },
} as const

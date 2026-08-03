export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      contadores_folio: {
        Row: {
          fecha: string;
          ultimo: number;
        };
        Insert: {
          fecha: string;
          ultimo?: number;
        };
        Update: {
          fecha?: string;
          ultimo?: number;
        };
        Relationships: [];
      };
      establecimientos: {
        Row: {
          activo: boolean;
          actualizado_en: string;
          ciudad: string | null;
          creado_en: string;
          direccion: string | null;
          hora_apertura_default: string | null;
          id: string;
          nombre: string;
          nombre_busqueda: string | null;
          notas_internas: string | null;
          telefono: string | null;
          verificado: boolean;
        };
        Insert: {
          activo?: boolean;
          actualizado_en?: string;
          ciudad?: string | null;
          creado_en?: string;
          direccion?: string | null;
          hora_apertura_default?: string | null;
          id?: string;
          nombre: string;
          nombre_busqueda?: string | null;
          notas_internas?: string | null;
          telefono?: string | null;
          verificado?: boolean;
        };
        Update: {
          activo?: boolean;
          actualizado_en?: string;
          ciudad?: string | null;
          creado_en?: string;
          direccion?: string | null;
          hora_apertura_default?: string | null;
          id?: string;
          nombre?: string;
          nombre_busqueda?: string | null;
          notas_internas?: string | null;
          telefono?: string | null;
          verificado?: boolean;
        };
        Relationships: [];
      };
      intentos_acceso: {
        Row: {
          bloqueado_hasta: string | null;
          intentos: number;
          ip: string;
          ultimo_en: string;
        };
        Insert: {
          bloqueado_hasta?: string | null;
          intentos?: number;
          ip: string;
          ultimo_en?: string;
        };
        Update: {
          bloqueado_hasta?: string | null;
          intentos?: number;
          ip?: string;
          ultimo_en?: string;
        };
        Relationships: [];
      };
      pedido_eventos: {
        Row: {
          creado_en: string;
          estado_anterior: Database["public"]["Enums"]["estado_pedido"] | null;
          estado_nuevo: Database["public"]["Enums"]["estado_pedido"];
          id: number;
          pedido_id: string;
          usuario_id: string | null;
        };
        Insert: {
          creado_en?: string;
          estado_anterior?: Database["public"]["Enums"]["estado_pedido"] | null;
          estado_nuevo: Database["public"]["Enums"]["estado_pedido"];
          id?: number;
          pedido_id: string;
          usuario_id?: string | null;
        };
        Update: {
          creado_en?: string;
          estado_anterior?: Database["public"]["Enums"]["estado_pedido"] | null;
          estado_nuevo?: Database["public"]["Enums"]["estado_pedido"];
          id?: number;
          pedido_id?: string;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pedido_eventos_pedido_id_fkey";
            columns: ["pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedido_eventos_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      pedido_items: {
        Row: {
          cantidad: number;
          categoria: Database["public"]["Enums"]["categoria_producto"];
          id: string;
          pedido_id: string;
          producto_id: string;
          producto_nombre: string;
          producto_presentacion: string | null;
        };
        Insert: {
          cantidad: number;
          categoria: Database["public"]["Enums"]["categoria_producto"];
          id?: string;
          pedido_id: string;
          producto_id: string;
          producto_nombre: string;
          producto_presentacion?: string | null;
        };
        Update: {
          cantidad?: number;
          categoria?: Database["public"]["Enums"]["categoria_producto"];
          id?: string;
          pedido_id?: string;
          producto_id?: string;
          producto_nombre?: string;
          producto_presentacion?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey";
            columns: ["pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey";
            columns: ["producto_id"];
            isOneToOne: false;
            referencedRelation: "productos";
            referencedColumns: ["id"];
          },
        ];
      };
      pedidos: {
        Row: {
          actualizado_en: string;
          archivado_en: string | null;
          creado_en: string;
          creado_por: string | null;
          dispositivo: string | null;
          eliminado_en: string | null;
          establecimiento_id: string;
          establecimiento_nombre: string;
          estado: Database["public"]["Enums"]["estado_pedido"];
          fecha_entrega: string;
          fecha_operacion: string;
          folio: string;
          hora_apertura: string;
          id: string;
          notas: string | null;
          origen: Database["public"]["Enums"]["origen_pedido"];
          req_etiquetado: boolean;
          total_botellas: number;
        };
        Insert: {
          actualizado_en?: string;
          archivado_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          dispositivo?: string | null;
          eliminado_en?: string | null;
          establecimiento_id: string;
          establecimiento_nombre: string;
          estado?: Database["public"]["Enums"]["estado_pedido"];
          fecha_entrega?: string;
          fecha_operacion?: string;
          folio?: string;
          hora_apertura: string;
          id?: string;
          notas?: string | null;
          origen?: Database["public"]["Enums"]["origen_pedido"];
          req_etiquetado?: boolean;
          total_botellas?: number;
        };
        Update: {
          actualizado_en?: string;
          archivado_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          dispositivo?: string | null;
          eliminado_en?: string | null;
          establecimiento_id?: string;
          establecimiento_nombre?: string;
          estado?: Database["public"]["Enums"]["estado_pedido"];
          fecha_entrega?: string;
          fecha_operacion?: string;
          folio?: string;
          hora_apertura?: string;
          id?: string;
          notas?: string | null;
          origen?: Database["public"]["Enums"]["origen_pedido"];
          req_etiquetado?: boolean;
          total_botellas?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_creado_por_fkey";
            columns: ["creado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_establecimiento_id_fkey";
            columns: ["establecimiento_id"];
            isOneToOne: false;
            referencedRelation: "establecimientos";
            referencedColumns: ["id"];
          },
        ];
      };
      productos: {
        Row: {
          activo: boolean;
          categoria: Database["public"]["Enums"]["categoria_producto"];
          color_hex: string | null;
          creado_en: string;
          id: string;
          nombre: string;
          orden_visual: number;
          presentacion: string | null;
          sku: string;
          unidad: string;
        };
        Insert: {
          activo?: boolean;
          categoria: Database["public"]["Enums"]["categoria_producto"];
          color_hex?: string | null;
          creado_en?: string;
          id?: string;
          nombre: string;
          orden_visual?: number;
          presentacion?: string | null;
          sku: string;
          unidad?: string;
        };
        Update: {
          activo?: boolean;
          categoria?: Database["public"]["Enums"]["categoria_producto"];
          color_hex?: string | null;
          creado_en?: string;
          id?: string;
          nombre?: string;
          orden_visual?: number;
          presentacion?: string | null;
          sku?: string;
          unidad?: string;
        };
        Relationships: [];
      };
      usuarios: {
        Row: {
          activo: boolean;
          auth_user_id: string | null;
          creado_en: string;
          id: string;
          nombre: string;
          rol: Database["public"]["Enums"]["rol_usuario"];
        };
        Insert: {
          activo?: boolean;
          auth_user_id?: string | null;
          creado_en?: string;
          id?: string;
          nombre: string;
          rol?: Database["public"]["Enums"]["rol_usuario"];
        };
        Update: {
          activo?: boolean;
          auth_user_id?: string | null;
          creado_en?: string;
          id?: string;
          nombre?: string;
          rol?: Database["public"]["Enums"]["rol_usuario"];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      crear_pedido: {
        Args: {
          p_dispositivo: string;
          p_establecimiento_id: string;
          p_establecimiento_nuevo: string;
          p_fecha_entrega: string;
          p_hora_apertura: string;
          p_items: Json;
          p_notas: string;
          p_origen: Database["public"]["Enums"]["origen_pedido"];
          p_req_etiquetado: boolean;
        };
        Returns: Json;
      };
      esta_bloqueado: { Args: { p_ip: string }; Returns: boolean };
      registrar_intento_fallido: { Args: { p_ip: string }; Returns: boolean };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      siguiente_folio: { Args: never; Returns: string };
    };
    Enums: {
      categoria_producto: "agua" | "pulpa";
      estado_pedido:
        | "recibido"
        | "pendiente_recoleccion"
        | "en_reparto"
        | "entregado"
        | "cancelado";
      origen_pedido: "cliente" | "operador";
      rol_usuario: "admin" | "operador" | "repartidor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      categoria_producto: ["agua", "pulpa"],
      estado_pedido: [
        "recibido",
        "pendiente_recoleccion",
        "en_reparto",
        "entregado",
        "cancelado",
      ],
      origen_pedido: ["cliente", "operador"],
      rol_usuario: ["admin", "operador", "repartidor"],
    },
  },
} as const;

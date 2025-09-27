"use client";

import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const { toast } = useToast();
  const [testing, setTesting] = React.useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        toast({
          title: "Erro de Conexão Supabase",
          description: `Não foi possível conectar ou obter a sessão: ${error.message}`,
          variant: "destructive",
        });
      } else if (data.session) {
        toast({
          title: "Conexão Supabase OK!",
          description: `Sessão ativa encontrada para o usuário: ${data.session.user.email}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Conexão Supabase OK!",
          description: "Nenhuma sessão ativa, mas a conexão com o Supabase está funcionando.",
          variant: "default",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro Inesperado no Supabase",
        description: `Ocorreu um erro: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  // Removed useEffect to run test automatically on mount.
  // Now it only runs when the button is clicked.

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={runTest} disabled={testing}>
        {testing ? "Testando..." : "Testar Supabase"}
      </Button>
    </div>
  );
};

export default SupabaseTest;
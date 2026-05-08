import { ReportsService } from './reports.service.js';

const reportsService = new ReportsService();

class ReportsController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportsService.getDashboardStats(req.user.tipo);
      
      // Adaptar formato para compatibilidade com frontend
      const response = {
        totalUsuarios: stats.usuarios.total,
        totalGestores: stats.usuarios.porTipo.gestor || 0,
        totalColaboradores: stats.usuarios.porTipo.colaborador || 0,
        totalAvaliacoes: stats.avaliacoes.total,
        totalNineBox: stats.nineBox.total || 0,
        avaliacoes180: stats.avaliacoes.porTipo.gestor_para_colaborador || 0,
        avaliacoes360: stats.avaliacoes.porTipo.colaborador_para_gestor || 0,
        mediaGeral: parseFloat(stats.avaliacoes.mediaGeral.toFixed(1)),
        ultimasAvaliacoes: stats.avaliacoes.lista || [],
        // Manter também o formato original para compatibilidade
        usuarios: stats.usuarios,
        avaliacoes: stats.avaliacoes,
        nineBox: stats.nineBox,
        competencias: stats.competencias,
        timestamp: stats.timestamp
      };
      
      return res.json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReport(req, res, next) {
    try {
      const report = await reportsService.getUserReport(
        req.params.userId,
        req.user.userId,
        req.user.tipo
      );
      
      // Adaptar formato para compatibilidade com frontend
      const response = {
        user: report.usuario,
        usuario: report.usuario, // Manter ambos para compatibilidade
        avaliacoesRecebidas: report.avaliacoesRecebidas.total,
        avaliacoesFeitas: report.avaliacoesFeitas.total,
        mediaGeral: parseFloat(report.avaliacoesRecebidas.mediaGeral.toFixed(1)),
        ultimasAvaliacoes: report.avaliacoesRecebidas.lista.slice(0, 10),
        criteriosMedia: this.calcularMediaCriterios(report.avaliacoesRecebidas.lista),
        nineBox: report.nineBox,
        // Manter também o formato original para compatibilidade
        avaliacoesRecebidasDetalhes: report.avaliacoesRecebidas,
        avaliacoesFeitasDetalhes: report.avaliacoesFeitas,
        timestamp: report.timestamp
      };
      
      return res.json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
  
  calcularMediaCriterios(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) return {};
    
    const criterios = ['pontualidade', 'comunicacao', 'tecnico', 'proatividade', 'equipe'];
    const medias = {};
    
    criterios.forEach(criterio => {
      const valores = avaliacoes
        .map(a => a.criterios?.[criterio])
        .filter(v => v > 0);
      
      if (valores.length > 0) {
        medias[criterio] = parseFloat((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1));
      } else {
        medias[criterio] = 0;
      }
    });
    
    return medias;
  }

  async getTeamReport(req, res, next) {
    try {
      const report = await reportsService.getTeamReport(
        req.params.gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async exportUserReport(req, res, next) {
    try {
      const data = await reportsService.exportUserReport(
        req.params.userId,
        req.user.userId,
        req.user.tipo
      );

      // Define headers para download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=export-${Date.now()}.json`);
      
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export { ReportsController };

class Abilities(object):
  def __init__(self, player, **abilities)
    self.player = player
    self.can_translate_modern   = abilities['can_translate']          || False
    self.can_translate_ancient  = abilities['can_translate_ancient']  || False
    self.can_identify_poison    = abilities['can_identify_poison']    || False
    self.is_hunter              = abilities['is_hunter']              || False
    self.repair_amount          = abilities['repair_amount']          || 0
    self.craftables             = abilities['craftables']             || []
    self.can_fillet             = abilities['can_fillet']             || False
    self.can_setup_camp         = abilities['can_setup_camp']         || False
    self.heal_amount            = abilities['heal_amount']            || 0
    self.movement               = abilities['movement']               || []
    self.can_update_maps        = abilities['can_update_maps']        || False
    self.line_of_sight_diff     = abilities['line_of_sight']          || 0
    self.can_smelt              = abilities['can_smelt']              || False

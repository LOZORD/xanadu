class Abilities(object):
  def __init__(self, player, **abilities):
    self.player = player
    self.can_translate_modern = abilities.get('can_translate', False)
    self.can_translate_ancient = abilities.get('can_translate_ancient', False)
    self.can_identify_poison = abilities.get('can_identify_poison', False)
    self.is_hunter = abilities.get('is_hunter', False)
    self.repair_amount = abilities.get('repair_amount', 0)
    self.craftables = abilities.get('craftables', [])
    self.can_fillet = abilities.get('can_fillet', False)
    self.can_setup_camp = abilities.get('can_setup_camp', False)
    self.heal_amount = abilities.get('heal_amount', 0)
    self.movement = abilities.get('movement', [])
    self.can_update_maps = abilities.get('can_update_maps', False)
    self.line_of_sight_diff = abilities.get('line_of_sight', 0)
    self.can_smelt = abilities.get('can_smelt', False)

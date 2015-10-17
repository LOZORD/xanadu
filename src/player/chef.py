from base_player import BasePlayer

class Chef(BasePlayer):
  def __init__(self, **kwargs):
    super(Chef, self).__init__(kwargs)
    self.inventory.extend(['knife', 'matches', 'food'])
    self.can_setup_camp = True
    self.can_identify_poison = True
    self.can_fillet = True

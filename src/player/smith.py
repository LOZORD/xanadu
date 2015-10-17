from base_player import BasePlayer

class Smith(BasePlayer):
    def __init__(self, **kwargs):
      super(Smith, self).__init__(kwargs)
      self.inventory.extend(['matches'])
      self.can_setup_camp = True
      self.can_smelt = True
      self.repair_amount = 1.0

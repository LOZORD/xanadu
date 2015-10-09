class Benefactor(BasePlayer):
  def __init__(self):
    super(Benefactor, self).__init__()
    self.gold *= 5
    self.inventory.extend(['matches', 'map to xanadu', 'revolver',
      'ancient mongolian translation book'])
    self.requires_translation = False
